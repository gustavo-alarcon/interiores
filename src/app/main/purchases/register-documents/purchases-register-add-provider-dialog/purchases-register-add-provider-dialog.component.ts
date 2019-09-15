import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-purchases-register-add-provider-dialog',
  templateUrl: './purchases-register-add-provider-dialog.component.html',
  styles: []
})
export class PurchasesRegisterAddProviderDialogComponent implements OnInit {

  loading = false;

  dataFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<PurchasesRegisterAddProviderDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      name: [null, [Validators.required]],
      ruc: [null, [Validators.required]],
      address: [null, [Validators.required]],
      phone: null
    })
  }

  create(): void {
    this.loading = true;

    const data = {
      id: '',
      name: this.dataFormGroup.value['name'],
      address: this.dataFormGroup.value['address'],
      ruc: this.dataFormGroup.value['ruc'],
      regDate: Date.now(),
      createdBy: this.auth.userInteriores.displayName,
      createdByUid: this.auth.userInteriores.uid,
    }

    this.dbs.providersCollection
      .add(data)
      .then(ref => {
        ref.update({ id: ref.id })
          .then(() => {
            this.loading = false;
            this.snackbar.open('Proveedor creado!', 'Cerrar', {
              duration: 6000
            });

            data.id = ref.id;

            this.dialogRef.close(data);
          })
          .catch(err => {
            this.loading = false;
            console.log(err);
            this.snackbar.open('Hubo un error actualizando el ID del proveedor', 'Cerrar', {
              duration: 6000
            });
          })
      })
      .catch(err => {
        this.loading = false;
        console.log(err);
        this.snackbar.open('Hubo un error creando al proveedor', 'Cerrar', {
          duration: 6000
        });
      })
  }
}


