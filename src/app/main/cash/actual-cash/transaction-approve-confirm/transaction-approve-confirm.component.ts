import { Component, OnInit, Inject } from '@angular/core';
import { Transaction } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-transaction-approve-confirm',
  templateUrl: './transaction-approve-confirm.component.html',
  styles: []
})
export class TransactionApproveConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    approved: false
  }

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<TransactionApproveConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { transaction: Transaction }
  ) { }

  ngOnInit() {
    console.log(this.data);
  }

  approve(): void {
    this.uploading = true;

    this.dbs.cashListCollection
      .doc(this.auth.userInteriores.currentCash.id)
      .collection('openings')
      .doc(this.auth.userInteriores.currentCash.currentOpening)
      .collection('transactions')
      .doc(this.data.transaction.id)
      .update({ verified: true, status: 'Aprobado' })
      .then(() => {
        this.uploading = false;
        this.snackbar.open(`Transacción aprobada!`, 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true);
      })
      .catch(err => {
        this.uploading = false;
        console.log(err);
        this.snackbar.open('Hubo un error aprobando la transacción!', 'Cerrar', {
          duration: 6000
        });
      })
  }

}
