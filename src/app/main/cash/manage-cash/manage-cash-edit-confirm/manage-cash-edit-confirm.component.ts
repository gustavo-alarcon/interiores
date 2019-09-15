import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { Cash } from 'src/app/core/types';

@Component({
  selector: 'app-manage-cash-edit-confirm',
  templateUrl: './manage-cash-edit-confirm.component.html',
  styles: []
})
export class ManageCashEditConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    edited: false
  }

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<ManageCashEditConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: {cash: Cash, form: any}

  ) { }

  ngOnInit() {
  }

  edit(): void {
    try {
      this.uploading = true;

      let data = {
        name: this.data.form['name'].trim(),
        location: this.data.form['location'],
        supervisor: this.data.form['supervisor'],
        password: this.data.form['password'].trim(),
        lastEditBy: this.auth.userInteriores.displayName,
        lastEditByUid: this.auth.userInteriores.uid,
        lastEditDate: Date.now()
      };

      this.dbs.cashListCollection
      .doc(this.data.cash.id)
      .update(data)
      .then(() => {
        this.uploading = false;
        this.flags.edited = true;
        this.snackbar.open(`Caja ${this.data.cash.name} editada!`, 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true);
      })
      .catch(err => {
        this.uploading = false;
        this.snackbar.open('Hubo un error editando la caja!', 'Cerrar', {
          duration: 6000
        });
        console.log('Error editando caja - thenCatch', err);
      })
    } catch (error) {
      this.uploading = false;
      console.log('Error editando caja - tryCatch', error);
    }
  }

}
