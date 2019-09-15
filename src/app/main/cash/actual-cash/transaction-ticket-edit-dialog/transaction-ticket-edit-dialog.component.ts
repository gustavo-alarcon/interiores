import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { Transaction, User } from 'src/app/core/types';
import { startWith, map } from 'rxjs/operators';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { TransactionTicketEditConfirmComponent } from '../transaction-ticket-edit-confirm/transaction-ticket-edit-confirm.component';

@Component({
  selector: 'app-transaction-ticket-edit-dialog',
  templateUrl: './transaction-ticket-edit-dialog.component.html',
  styles: []
})
export class TransactionTicketEditDialogComponent implements OnInit {

  dataFormGroup: FormGroup;

  paymentTypes = [
    'TARJETA VISA',
    'TARJETA MASTERCARD',
    'TARJETA ESTILOS',
    'EFECTIVO'
  ]

  ticketTypes = [
    'VENTA',
    'SERVICIO',
    'PEDIDO',
    'SEPARACION',
    'OTRO'
  ]

  filteredUsers: Observable<User[]>;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<TransactionTicketEditDialogComponent>,
    public dbs: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data: { transaction: Transaction }
  ) { }

  ngOnInit() {
    this.createForm();

    this.filteredUsers =
      this.dataFormGroup.get('user').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.displayName.toLowerCase()),
          map(name => name ? this.dbs.users.filter(option => option.displayName.toLowerCase().includes(name)) : this.dbs.users)
        )
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      description: [this.data.transaction.description, [Validators.required]],
      import: [this.data.transaction.import, [Validators.required]],
      ticketType: [this.data.transaction.ticketType, [Validators.required]],
      paymentType: [this.data.transaction.paymentType, [Validators.required]],
      debt: [this.data.transaction.debt, [Validators.required]],
      user: [this.data.transaction.user, [Validators.required, isObjectValidator]]
    });
  }

  showUser(user: User): string | null {
    return user ? user.displayName : null;
  }

  edit(): void {
    this.dialog.open(TransactionTicketEditConfirmComponent, {
      data: {
        transaction: this.data.transaction,
        form: this.dataFormGroup.value
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.dialogRef.close();
      }
    });
  }

}
