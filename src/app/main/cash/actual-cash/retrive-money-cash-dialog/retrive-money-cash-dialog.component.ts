import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { Observable } from 'rxjs';
import { User } from 'src/app/core/types';
import { startWith, map } from 'rxjs/operators';
import { RetriveMoneyCashConfirmComponent } from '../retrive-money-cash-confirm/retrive-money-cash-confirm.component';

@Component({
  selector: 'app-retrive-money-cash-dialog',
  templateUrl: './retrive-money-cash-dialog.component.html',
  styles: []
})
export class RetriveMoneyCashDialogComponent implements OnInit {


  paymentTypes = [
    'EFECTIVO',
    'TRANSFERENCIA'
  ]

  departureTypes = [
    'MATERIA PRIMA',
    'GASTO',
    'TRANSFERENCIA',
    'PRESTAMO'
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
    private dialogRef: MatDialogRef<RetriveMoneyCashDialogComponent>,
    public dbs: DatabaseService
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
      description: [null, [Validators.required]],
      import: [null, [Validators.required]],
      departureType: [null, [Validators.required]],
      expenseType: null,
      paymentType: [null, [Validators.required]],
      originAccount: null,
      user: [null, [Validators.required, isObjectValidator]]
    });
  }

  showUser(user : User): string | null {
    return user ? user.displayName : null;
  }

  retriveMoney(): void {
    this.dialog.open(RetriveMoneyCashConfirmComponent, {
      data: {
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
