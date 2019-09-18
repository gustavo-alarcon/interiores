import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Transaction } from 'src/app/core/types';

@Component({
  selector: 'app-transaction-cancel-confirm',
  templateUrl: './transaction-cancel-confirm.component.html',
  styles: []
})
export class TransactionCancelConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    canceled: false
  }

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<TransactionCancelConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { transaction: Transaction }
  ) { }

  ngOnInit() {
  }

  cancel(): void {
    this.uploading = true;

    this.dbs.cashListCollection
      .doc(this.auth.userInteriores.currentCash.id)
      .collection('openings')
      .doc(this.auth.userInteriores.currentCash.currentOpening)
      .collection('transactions')
      .doc(this.data.transaction.id)
      .update({ verified: false, status: 'Anulado' })
      .then(() => {
        this.uploading = false;
        this.snackbar.open(`Transacción anulada!`, 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true);
      })
      .catch(err => {
        this.uploading = false;
        console.log(err);
        this.snackbar.open('Hubo un error anulando la transacción!', 'Cerrar', {
          duration: 6000
        });
      })
  }

}
