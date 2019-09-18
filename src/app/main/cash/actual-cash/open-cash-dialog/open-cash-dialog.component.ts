import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { Cash } from 'src/app/core/types';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { OpenCashConfirmComponent } from '../open-cash-confirm/open-cash-confirm.component';
import { MatDialog, MatDialogRef, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-open-cash-dialog',
  templateUrl: './open-cash-dialog.component.html',
  styles: []
})
export class OpenCashDialogComponent implements OnInit, OnDestroy {

  dataFormGroup: FormGroup;

  filteredCashList: Observable<Cash[]>;

  currentCash: Cash = null;

  rightPassword: boolean = false;
  alreadyOpened: boolean = false;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<OpenCashDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

    this.filteredCashList =
      this.dataFormGroup.get('cash').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
          map(name => name ? this.dbs.cashList.filter(option => option.name.toLowerCase().includes(name)) : this.dbs.cashList)
        );

    const pass =
      this.dataFormGroup.get('password').valueChanges
        .pipe(
          debounceTime(300),
        )
        .subscribe(res => {
          try {
            if (this.currentCash) {
              if (res === this.currentCash.password) {
                if (this.currentCash.open) {
                  this.snackbar.open(`Caja ${this.currentCash.name} ya se encuentra abierta`, 'Cerrar', {
                    duration: 6000
                  });
                  this.alreadyOpened = true;
                } else {
                  this.rightPassword = true;
                  this.alreadyOpened = false;
                }
              } else {
                this.rightPassword = false;
                this.snackbar.open('Contraseña incorrecta', 'Cerrar', {
                  duration: 6000
                });
              }
            }
          } catch (error) {
            console.log(error);
          }


        });

    this.subscriptions.push(pass);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      cash: [null, [Validators.required, isObjectValidator]],
      password: [null, [Validators.required]],
      openingBalance: [null, [Validators.required]]
    });
  }

  showCash(cash: Cash): string | null {
    return cash ? cash.name : null;
  }

  selectedCash(event): void {
    this.currentCash = event.option.value;
    if (this.currentCash.open) {
      this.alreadyOpened = true;
      this.snackbar.open(`Caja ${this.currentCash.name} ya se encuentra abierta`, 'Cerrar', {
        duration: 6000
      });
    } else {
      this.alreadyOpened = false;
    }
  }

  openCash(): void {
    this.dialog.open(OpenCashConfirmComponent, {
      data: {
        cash: this.currentCash,
        openingBalance: this.dataFormGroup.value['openingBalance']
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.dialogRef.close(true);
      }
    })
  }

}
