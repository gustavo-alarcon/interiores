import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { Provider } from 'src/app/core/types';
import { tap, debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-third-parties-providers-create-dialog',
  templateUrl: './third-parties-providers-create-dialog.component.html',
  styles: []
})
export class ThirdPartiesProvidersCreateDialogComponent implements OnInit {

  loading = false;

  dataFormGroup: FormGroup;

  duplicate = {
    ruc: false,
    rucLoading: false,
  }

  contactList: Array<{
    contactName: string,
    contactPhone?: string,
    contactMail?: string
  }> = [];

  bankAccounts: Array<{
    bank: string,
    type: string,
    accountNumber: string
  }> = [];

  bankList = [
    'BCP',
    'INTERBANK',
    'BBVA CONTINENTAL',
    'SCOTIABANK',
    'CAJA AREQUIPA',
  ];

  bankAccountTypes = [
    'AHORROS',
    'CTA. CORRIENTE'
  ];
  
  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<ThirdPartiesProvidersCreateDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

    const ruc$ =
      this.dataFormGroup.get('ruc').valueChanges
        .pipe(
          tap(() => {
            this.duplicate.rucLoading = true;
          }),
          debounceTime(500),
          tap(res => {

            this.duplicate.ruc = false;
            const find = this.dbs.wholesale.filter(option => option.ruc === res);

            if (find.length > 0) {
              this.duplicate.rucLoading = false;
              this.duplicate.ruc = true;
              this.snackbar.open('Ya existe este proveedor en el sistema', 'Cerrar', {
                duration: 4000
              });
            } else {
              this.duplicate.rucLoading = false;
            }
          })
        ).subscribe()

    this.subscriptions.push(ruc$);
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      name: [null, [Validators.required]],
      ruc: [null, [Validators.required]],
      address: [null, [Validators.required]],
      phone: null,
      detractionAccount: null,
      bank: null,
      type: null,
      accountNumber: null,
      contactName: null,
      contactPhone: null,
      contactMail: null
    });
  }

  addContact(): void {
    if (this.dataFormGroup.value['contactName']) {
      const contact = {
        index: this.contactList.length,
        contactName: this.dataFormGroup.value['contactName'],
        contactPhone: this.dataFormGroup.value['contactPhone'],
        contactMail: this.dataFormGroup.value['contactMail'],
      };

      this.contactList.push(contact);

      this.dataFormGroup.get('contactName').reset();
      this.dataFormGroup.get('contactPhone').reset();
      this.dataFormGroup.get('contactMail').reset();

    } else {
      this.snackbar.open('Para agregar un contacto, debes asignar nombres y apellidos', 'Cerrar', {
        duration: 6000
      });
    }
  }

  removeContact(index: number): void {
    this.contactList.splice(index, 1);

    this.contactList.forEach((element, index) => {
      element['index'] = index;
    });
  }

  addBank(): void {
    if (this.dataFormGroup.value['bank'] && this.dataFormGroup.value['type'] && this.dataFormGroup.value['accountNumber']) {
      const bank = {
        index: this.bankAccounts.length,
        bank: this.dataFormGroup.value['bank'],
        type: this.dataFormGroup.value['type'],
        accountNumber: this.dataFormGroup.value['accountNumber'],
      };

      this.bankAccounts.push(bank);

      this.dataFormGroup.get('bank').reset();
      this.dataFormGroup.get('type').reset();
      this.dataFormGroup.get('accountNumber').reset();

    } else {
      this.snackbar.open('Para agregar una cuenta de deposito, debe llenar todos los campos', 'Cerrar', {
        duration: 6000
      });
    }
  }

  removeBank(index: number): void {
    this.bankAccounts.splice(index, 1);

    this.bankAccounts.forEach((element, index) => {
      element['index'] = index;
    });
  }

  create(): void {
    this.loading = true;

    const data: Provider = {
      id: '',
      name: this.dataFormGroup.value['name'],
      address: this.dataFormGroup.value['address'],
      ruc: this.dataFormGroup.value['ruc'],
      phone: this.dataFormGroup.value['phone'],
      detractionAccount: this.dataFormGroup.value['detractionAccount'],
      contacts: this.contactList,
      bankAccounts: this.bankAccounts,
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

            this.dialogRef.close(true);
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
