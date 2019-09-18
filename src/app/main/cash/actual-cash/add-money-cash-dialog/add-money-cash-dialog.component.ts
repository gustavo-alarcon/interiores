import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { AddMoneyCashConfirmComponent } from '../add-money-cash-confirm/add-money-cash-confirm.component';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { User } from 'src/app/core/types';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-add-money-cash-dialog',
  templateUrl: './add-money-cash-dialog.component.html',
  styles: []
})
export class AddMoneyCashDialogComponent implements OnInit {

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
    'SEPARADO',
    'OTRO'
  ]

  filteredUsers: Observable<User[]>;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<AddMoneyCashDialogComponent>,
    public dbs: DatabaseService,
    public auth: AuthService
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
      ticketType : [null, [Validators.required]],
      paymentType: [null, [Validators.required]],
      debt: [null, [Validators.required]],
      user: [this.auth.userInteriores, [Validators.required, isObjectValidator]]
    });
  }

  showUser(user : User): string | null {
    return user ? user.displayName : null;
  }

  addMoney(): void {
    this.dialog.open(AddMoneyCashConfirmComponent, {
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
