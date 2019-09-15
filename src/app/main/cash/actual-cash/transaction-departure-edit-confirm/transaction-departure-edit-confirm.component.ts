import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Transaction } from 'src/app/core/types';

@Component({
  selector: 'app-transaction-departure-edit-confirm',
  templateUrl: './transaction-departure-edit-confirm.component.html',
  styles: []
})
export class TransactionDepartureEditConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    edited: false
  }

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<TransactionDepartureEditConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { transaction: Transaction, form: any }
  ) { }

  ngOnInit() {
  }

  edit(): void {
    this.uploading = true;

    const data = {
      type: this.data.form['departureType'],
      description: this.data.form['description'],
      import: this.data.form['import'],
      user: this.data.form['user'],
      verified: true,
      status: 'Aprobado',
      ticketType: null,
      paymentType: this.data.form['paymentType'],
      expenseType: this.data.form['expenseType'],
      originAccount: this.data.form['originAccount'],
      debt: 0,
      lastEditBy: this.auth.userInteriores.displayName,
      lastEditUid: this.auth.userInteriores.uid,
      lastEditDate: Date.now()
    }

    this.dbs.cashListCollection
      .doc(this.auth.userInteriores.currentCash.id)
      .collection('openings')
      .doc(this.auth.userInteriores.currentCash.currentOpening)
      .collection('transactions')
      .doc(this.data.transaction.id)
      .update(data)
      .then(() => {
        this.flags.edited = true;
        this.uploading = false;
        this.snackbar.open('Transacción editada!', 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true);
      })
      .catch(err => {
        console.log(err);
        this.uploading = false;
        this.snackbar.open('Parece que hubo un error editando la transacción!', 'Cerrar', {
          duration: 6000
        });
      })
  }

}
