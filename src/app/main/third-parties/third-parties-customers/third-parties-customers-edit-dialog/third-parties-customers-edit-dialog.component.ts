import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Customer } from 'src/app/core/types';
import { tap, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-third-parties-customers-edit-dialog',
  templateUrl: './third-parties-customers-edit-dialog.component.html',
  styles: []
})
export class ThirdPartiesCustomersEditDialogComponent implements OnInit {

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
    private dialogRef: MatDialogRef<ThirdPartiesCustomersEditDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { customer: Customer }
  ) { }

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
      name: [this.data.customer.name, [Validators.required]],
      dni: [this.data.customer.dni, [Validators.required]],
      address: this.data.customer.address,
      phone: this.data.customer.phone,
      mail: this.data.customer.mail
    });
  }

  edit(): void {
    this.loading = true;

    const data = {
      dni: this.dataFormGroup.value['dni'],
      name: this.dataFormGroup.value['name'],
      address: this.dataFormGroup.value['address'],
      phone: this.dataFormGroup.value['phone'],
      mail: this.dataFormGroup.value['mail'],
    }

    this.dbs.customersCollection
      .doc(this.data.customer.id)
      .update(data)
      .then(() => {

        this.loading = false;
        this.snackbar.open('Cliente editado!', 'Cerrar', {
          duration: 6000
        });

        this.dialogRef.close(true);
      })
      .catch(err => {
        this.loading = false;
        console.log(err);
        this.snackbar.open('Hubo un error editando al cliente', 'Cerrar', {
          duration: 6000
        });
      })
  }

}
