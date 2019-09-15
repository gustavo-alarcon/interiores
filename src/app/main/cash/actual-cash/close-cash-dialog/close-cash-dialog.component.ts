import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { TotalImports } from 'src/app/core/types';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-close-cash-dialog',
  templateUrl: './close-cash-dialog.component.html',
  styles: []
})
export class CloseCashDialogComponent implements OnInit, OnDestroy {

  uploading: boolean = false;
  
  rightPassword: boolean = false;

  dataFormGroup: FormGroup;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CloseCashDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: TotalImports
  ) { }

  ngOnInit() {
    this.createForm();

    const pass =
      this.dataFormGroup.get('password').valueChanges
        .pipe(
          debounceTime(1000),
        )
        .subscribe(res => {
          if (res === this.data.currentCash.password) {
            this.rightPassword = true;
          } else {
            this.rightPassword = false;
            this.snackbar.open('Contraseña incorrecta!', 'Cerrar', {
              duration: 3000
            })
          }
        });

    this.subscriptions.push(pass);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      password: [null, [Validators.required]],
      closureBalance: [null, [Validators.required]]
    });
  }

  closeCash(): void {
    this.uploading = true;

    const cashData = {
      open: false,
      currentOwner: null,
      lastClosure: Date.now(),
      currentOpening: null,
    }

    this.dbs.cashListCollection
      .doc(this.data.currentCash.id)
      .update(cashData)
      .then(() => {
        const openingData = {
          closedBy: this.auth.userInteriores.displayName,
          closedByUid: this.auth.userInteriores.uid,
          closureDate: Date.now(),
          closureBalance: this.dataFormGroup.value['closureBalance'],
          totalImport: this.data.totalImport,
          totalTickets: this.data.totalTickets,
          totalDepartures: this.data.totalDepartures,
          totalTicketsByPaymentType: this.data.totalTicketsByPaymentType,
          totalDeparturesByPaymentType: this.data.totalDeparturesByPaymentType
        }

        this.dbs.cashListCollection
          .doc(this.data.currentCash.id)
          .collection('openings')
          .doc(this.data.currentCash.currentOpening)
          .update(openingData)
          .then(() => {
            this.uploading = false;
            this.snackbar.open(`Caja ${this.data.currentCash.name} cerrada!`, 'Cerrar', {
              duration: 6000
            });
            this.dialogRef.close(true);
          })
          .catch(err => {
            this.uploading = false;
            this.snackbar.open(`Hubo un error cerrando la caja`, 'Cerrar', {
              duration: 6000
            });
            console.log(err);
          });

        this.dbs.usersCollection
          .doc(this.auth.userInteriores.uid)
          .update({ currentCash: null })
      })
      .catch(err => {
        this.uploading = false;
        this.snackbar.open(`Hubo un error cerrando la caja`, 'Cerrar', {
          duration: 6000
        });
        console.log(err);
      });
  }

}
