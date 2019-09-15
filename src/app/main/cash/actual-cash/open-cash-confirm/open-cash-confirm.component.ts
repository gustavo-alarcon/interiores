import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Cash } from 'src/app/core/types';

@Component({
  selector: 'app-open-cash-confirm',
  templateUrl: './open-cash-confirm.component.html',
  styles: []
})
export class OpenCashConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    opened: false
  }

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<OpenCashConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { cash: Cash, openingBalance: number }
  ) { }

  ngOnInit() {
  }

  open(): void {
    this.uploading = true;

    const data = {
      currentOwner: this.auth.userInteriores,
      open: true,
      lastOpening: Date.now()
    }

    this.dbs.cashListCollection
      .doc(this.data.cash.id)
      .update(data)
      .then(() => {

        const openingData = {
          openedBy: this.auth.userInteriores.displayName,
          closedBy: null,
          openingDate: data.lastOpening,
          closureDate: null,
          openingBalance: this.data.openingBalance,
          closureBalance: null,
          importAdded: null,
          importWithdrawn: null,
          cashCount: null
        }

        this.dbs.cashListCollection
          .doc(this.data.cash.id)
          .collection('openings')
          .add(openingData)
          .then(ref => {
            ref.update({id: ref.id});

            this.dbs.cashListCollection
            .doc(this.data.cash.id)
            .update({currentOpening: ref.id});

            let currentData = {
              currentOpening: ref.id
            }

            const finalData = Object.assign(currentData, this.data.cash);

            finalData.currentOwner = this.auth.userInteriores;
            finalData.open = true;
            finalData.lastOpening = data.lastOpening;
            finalData.currentOpening = ref.id;
            
            this.dbs.usersCollection
              .doc(this.auth.userInteriores.uid)
              .update({currentCash: finalData})
              .then(() => {
                this.uploading = false;
                this.flags.opened = true;
                this.snackbar.open(`Caja ${this.data.cash.name} abierta!`, 'Cerrar', {
                  duration: 6000
                });
                this.dialogRef.close(true);
              })
              .catch(err => {
                this.uploading = false;
                console.log(err);
                this.snackbar.open('Hubo un error guardando caja actual', 'Cerrar', {
                  duration: 6000
                });
              })
          })
          .catch(err => {
            this.uploading = false;
            console.log(err);
            this.snackbar.open('Hubo un error guardando la apertura', 'Cerrar', {
              duration: 6000
            });
          })

      })
      .catch(err => {
        this.uploading = false;
        console.log(err);
        this.snackbar.open('Hubo un error abriendo la caja', 'Cerrar', {
          duration: 6000
        });
      })
  }

}
