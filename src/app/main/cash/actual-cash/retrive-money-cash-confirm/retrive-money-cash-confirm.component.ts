import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-retrive-money-cash-confirm',
  templateUrl: './retrive-money-cash-confirm.component.html',
  styles: []
})
export class RetriveMoneyCashConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    added: false
  }

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<RetriveMoneyCashConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { form: any }
  ) { }

  ngOnInit() {
  }

  remove(): void {
    this.uploading = true;

    const data = {
      id: '',
      regDate: Date.now(),
      type: this.data.form['departureType'],
      description: this.data.form['description'],
      import: this.data.form['import'],
      user: this.data.form['user'],
      verified: true,
      status: 'Aprobado',
      ticketType: null,
      paymentType: this.data.form['paymentType'],
      departureType: this.data.form['departureType'],
      expenseType: this.data.form['expenseType'],
      originAccount: this.data.form['originAccount'],
      debt: 0,
      lastEditBy: null,
      lastEditUid: null,
      lastEditDate: null,
      approvedBy: this.auth.userInteriores.displayName,
      approvedByUid: this.auth.userInteriores.uid,
      approvedDate: Date.now()
    }

    this.dbs.cashListCollection
      .doc(this.auth.userInteriores.currentCash.id)
      .collection('openings')
      .doc(this.auth.userInteriores.currentCash.currentOpening)
      .collection('transactions')
      .add(data)
      .then(ref => {
        ref.update({ id: ref.id });
        this.uploading = false;
        this.snackbar.open('Dinero retirado!', 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true);
      })
      .catch(err => {
        console.log(err);
        this.snackbar.open('Parece que hubo un error agregando el dinero!', 'Cerrar', {
          duration: 6000
        });
      })
  }

}
