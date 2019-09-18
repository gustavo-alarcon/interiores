import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { tap, debounceTime } from 'rxjs/operators';
import { Provider } from 'src/app/core/types';

@Component({
  selector: 'app-third-parties-providers-edit-dialog',
  templateUrl: './third-parties-providers-edit-dialog.component.html',
  styles: []
})
export class ThirdPartiesProvidersEditDialogComponent implements OnInit {

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
    private dialogRef: MatDialogRef<ThirdPartiesProvidersEditDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { provider: Provider }
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
      name: [this.data.provider.name, [Validators.required]],
      ruc: [this.data.provider.ruc, [Validators.required]],
      address: [this.data.provider.address, [Validators.required]],
      phone: this.data.provider.phone,
      detractionAccount: this.data.provider.detractionAccount,
      bank: null,
      type: null,
      accountNumber: null,
      contactName: null,
      contactPhone: null,
      contactMail: null
    });

    this.contactList = this.data.provider.contacts;
    this.bankAccounts = this.data.provider.bankAccounts;
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

  edit(): void {
    this.loading = true;

    const data = {
      name: this.dataFormGroup.value['name'],
      address: this.dataFormGroup.value['address'],
      ruc: this.dataFormGroup.value['ruc'],
      phone: this.dataFormGroup.value['phone'],
      detractionAccount: this.dataFormGroup.value['detractionAccount'],
      contacts: this.contactList,
      bankAccounts: this.bankAccounts,
      editedBy: this.auth.userInteriores,
      editedDate: Date.now()
    }

    this.dbs.providersCollection
      .doc(this.data.provider.id)
      .update(data)
      .then(() => {
        this.loading = false;
        this.snackbar.open('Proveedor editado!', 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true);
      })
      .catch(err => {
        this.loading = false;
        console.log(err);
        this.snackbar.open('Hubo un error editando al proveedor', 'Cerrar', {
          duration: 6000
        });
      })
  }
}
