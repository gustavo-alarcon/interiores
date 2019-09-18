import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Purchase } from 'src/app/core/types';

@Component({
  selector: 'app-purchases-register-verify-confirm',
  templateUrl: './purchases-register-verify-confirm.component.html',
  styles: []
})
export class PurchasesRegisterVerifyConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    verified: false
  }

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<PurchasesRegisterVerifyConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { purchase: Purchase }
  ) { }

  ngOnInit() {
  }

  verify(): void {
    this.uploading = true;

    const data = {
      verifiedByAccountant: true,
      verifiedBy: this.auth.userInteriores.displayName,
      verifiedByUid: this.auth.userInteriores.uid,
      verifiedDate: Date.now()
    }

    this.dbs.purchasesCollection
      .doc(this.data.purchase.id)
      .update(data)
      .then(() => {
        this.uploading = false;
        this.snackbar.open('Documento verificado!', 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true);
      })
      .catch(err => {
        console.log(err);
        this.uploading = false;
        this.snackbar.open('Hubo un error verificando el documento!', 'Cerrar', {
          duration: 6000
        });
      })
  }

}
