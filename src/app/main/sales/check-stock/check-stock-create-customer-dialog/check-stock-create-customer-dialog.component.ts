import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { tap, debounceTime } from 'rxjs/operators';
import { Customer } from 'src/app/core/types';

@Component({
  selector: 'app-check-stock-create-customer-dialog',
  templateUrl: './check-stock-create-customer-dialog.component.html',
  styles: []
})
export class CheckStockCreateCustomerDialogComponent implements OnInit {

  loading = false;

  dataFormGroup: FormGroup;

  duplicate = {
    dni: false,
    dniLoading: false,
  }
  
  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<CheckStockCreateCustomerDialogComponent>,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.createForm();

    const dni$ =
      this.dataFormGroup.get('dni').valueChanges
        .pipe(
          tap(() => {
            this.duplicate.dniLoading = true;
          }),
          debounceTime(500),
          tap(res => {

            this.duplicate.dni = false;
            const find = this.dbs.customers.filter(option => option.dni === res);

            if (find.length > 0) {
              this.duplicate.dniLoading = false;
              this.duplicate.dni = true;
              this.snackbar.open('Ya existe este cliente en el sistema', 'Cerrar', {
                duration: 4000
              });
            } else {
              this.duplicate.dniLoading = false;
            }
          })
        ).subscribe()

    this.subscriptions.push(dni$);
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      name: [null, [Validators.required]],
      dni: [null, [Validators.required]],
      address: null,
      phone: null,
      mail: null
    });
  }

  create(): void {
    this.loading = true;

    const data: Customer = {
      id: '',
      dni: this.dataFormGroup.value['dni'],
      name: this.dataFormGroup.value['name'],
      address: this.dataFormGroup.value['address'],
      phone: this.dataFormGroup.value['phone'],
      mail: this.dataFormGroup.value['mail'],
      regDate: Date.now(),
      createdBy: this.auth.userInteriores,
    }

    this.dbs.customersCollection
      .add(data)
      .then(ref => {
        ref.update({ id: ref.id })
          .then(() => {
            this.loading = false;
            this.snackbar.open('Cliente creado!', 'Cerrar', {
              duration: 6000
            });

            data.id = ref.id;

            this.dialogRef.close(data);
          })
          .catch(err => {
            this.loading = false;
            console.log(err);
            this.snackbar.open('Hubo un error actualizando el ID del cliente', 'Cerrar', {
              duration: 6000
            });
          })
      })
      .catch(err => {
        this.loading = false;
        console.log(err);
        this.snackbar.open('Hubo un error creando al cliente', 'Cerrar', {
          duration: 6000
        });
      })
  }

}
