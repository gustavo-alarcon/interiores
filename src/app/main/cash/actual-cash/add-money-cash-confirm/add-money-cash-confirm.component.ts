import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-add-money-cash-confirm',
  templateUrl: './add-money-cash-confirm.component.html',
  styles: []
})
export class AddMoneyCashConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    added: false
  }

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<AddMoneyCashConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { form: any }
  ) { }

  ngOnInit() {
  }

  add(): void {
    this.uploading = true;

    const data = {
      id: '',
      regDate: Date.now(),
      type: this.data.form['ticketType'],
      description: this.data.form['description'],
      import: this.data.form['import'],
      user: this.data.form['user'],
      verified: true,
      status: 'Aprobado',
      ticketType: this.data.form['ticketType'],
      paymentType: this.data.form['paymentType'],
      expenseType: null,
      departureType: null,
      originAccount: null,
      debt: this.data.form['debt'],
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
        ref.update({id: ref.id});
        this.uploading = false;
        this.snackbar.open('Dinero agregado!', 'Cerrar', {
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
