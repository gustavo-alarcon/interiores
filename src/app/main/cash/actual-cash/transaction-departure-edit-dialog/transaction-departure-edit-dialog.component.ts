import { Component, OnInit, Inject } from '@angular/core';
import { User, Transaction } from 'src/app/core/types';
import { TransactionDepartureEditConfirmComponent } from '../transaction-departure-edit-confirm/transaction-departure-edit-confirm.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { startWith, map } from 'rxjs/operators';
import { isObjectValidator } from 'src/app/core/is-object-validator';

@Component({
  selector: 'app-transaction-departure-edit-dialog',
  templateUrl: './transaction-departure-edit-dialog.component.html',
  styles: []
})
export class TransactionDepartureEditDialogComponent implements OnInit {


  paymentTypes = [
    'EFECTIVO',
    'TRANSFERENCIA'
  ]

  departureTypes = [
    'MATERIA PRIMA',
    'GASTO',
    'TRANSFERENCIA'
  ]

  expenseTypes = [
    'MANTENIMIENTO',
    'MAQUINARIA',
    'CONTABILIDAD',
    'TIENDA',
    'OPERACIONES',
    'PERSONAL'
  ]

  originAccounts = [
    'CUENTA SHIRLEY',
    'CUENTA INTERIORES',
    'CUENTA FERNANDO'
  ]

  dataFormGroup: FormGroup;

  filteredUsers: Observable<User[]>;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<TransactionDepartureEditDialogComponent>,
    public dbs: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data : {transaction: Transaction}
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
      departureType: [this.data.transaction.departureType, [Validators.required]],
      expenseType: this.data.transaction.expenseType,
      paymentType: [this.data.transaction.paymentType, [Validators.required]],
      originAccount: this.data.transaction.originAccount,
      user: [this.data.transaction.user, [Validators.required, isObjectValidator]]
    });
    console.log(this.dataFormGroup.value);
  }

  showUser(user : User): string | null {
    return user ? user.displayName : null;
  }

  edit(): void {
    this.dialog.open(TransactionDepartureEditConfirmComponent, {
      data: {
        transaction: this.data.transaction,
        form: this.dataFormGroup.value
      }
    })
      .afterClosed().subscribe(res => {
        if (res) {
          this.dialogRef.close(true);
        }
      })
  }

}
