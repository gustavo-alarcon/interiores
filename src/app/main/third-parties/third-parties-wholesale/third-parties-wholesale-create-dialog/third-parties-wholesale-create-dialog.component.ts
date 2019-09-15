import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Category, Unit } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { tap, debounceTime } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-third-parties-wholesale-create-dialog',
  templateUrl: './third-parties-wholesale-create-dialog.component.html',
  styles: []
})
export class ThirdPartiesWholesaleCreateDialogComponent implements OnInit {

  loading = false;

  dataFormGroup: FormGroup;

  duplicate = {
    dni: false,
    dniLoading: false,
    ruc: false,
    rucLoading: false,
  }

  contactsList: Array<{
    contanctName?: string;
    contactPhone?: string;
    contactMail?: string;
  }> = [];

  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<ThirdPartiesWholesaleCreateDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

    const type$ =
      this.dataFormGroup.get('type').valueChanges
        .pipe(
          debounceTime(300)
        )
        .subscribe(res => {
          if (res === 'NATURAL') {

            this.dataFormGroup.get('dni').setValidators([Validators.required]);
            this.dataFormGroup.get('name').setValidators([Validators.required]);
            this.dataFormGroup.get('lastname').setValidators([Validators.required]);

            this.dataFormGroup.get('ruc').setValidators([]);
            this.dataFormGroup.get('businessName').setValidators([]);
            this.dataFormGroup.get('businessAddress').setValidators([]);

            this.dataFormGroup.get('dni').reset();
            this.dataFormGroup.get('name').reset();
            this.dataFormGroup.get('lastname').reset();
            this.dataFormGroup.get('ruc').reset();
            this.dataFormGroup.get('businessName').reset();
            this.dataFormGroup.get('businessAddress').reset();

            this.duplicate.dni = false;
            this.duplicate.ruc = false;

          } else {

            this.dataFormGroup.get('dni').setValidators([]);
            this.dataFormGroup.get('name').setValidators([]);
            this.dataFormGroup.get('lastname').setValidators([]);

            this.dataFormGroup.get('ruc').setValidators([Validators.required]);
            this.dataFormGroup.get('businessName').setValidators([Validators.required]);
            this.dataFormGroup.get('businessAddress').setValidators([Validators.required]);

            this.dataFormGroup.get('dni').reset();
            this.dataFormGroup.get('name').reset();
            this.dataFormGroup.get('lastname').reset();
            this.dataFormGroup.get('ruc').reset();
            this.dataFormGroup.get('businessName').reset();
            this.dataFormGroup.get('businessAddress').reset();

            this.duplicate.dni = false;
            this.duplicate.ruc = false;

          }
        });

    this.subscriptions.push(type$);

    const dni$ =
      this.dataFormGroup.get('dni').valueChanges
        .pipe(
          tap(() => {
            this.duplicate.dniLoading = true;
          }),
          debounceTime(500),
          tap(res => {

            this.duplicate.dni = false;
            const find = this.dbs.wholesale.filter(option => option.dni === res);

            if (find.length > 0) {
              this.duplicate.dniLoading = false;
              this.duplicate.dni = true;
              this.snackbar.open('Ya existe este DNI en el sistema', 'Cerrar', {
                duration: 4000
              });
            } else {
              this.duplicate.dniLoading = false;
            }
          })
        ).subscribe()

    this.subscriptions.push(dni$);

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
              this.snackbar.open('Ya existe este ruc en el sistema', 'Cerrar', {
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
      type: [null, [Validators.required]],
      dni: null,
      name: null,
      lastname: null,
      phone: null,
      mail: null,
      address: null,
      ruc: null,
      businessName: null,
      businessPhone: null,
      businessAddress: null,
      contacts: null,
      contactName: null,
      contactPhone: null,
      contactMail: null
    })
  }

  addContact(): void {
    if (this.dataFormGroup.value['contactName']) {
      const contact = {
        index: this.contactsList.length,
        contactName: this.dataFormGroup.value['contactName'],
        contactPhone: this.dataFormGroup.value['contactPhone'],
        contactMail: this.dataFormGroup.value['contactMail'],
      };

      this.contactsList.push(contact);

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
    this.contactsList.splice(index, 1);

    this.contactsList.forEach((element, index) => {
      element['index'] = index;
    });
  }

  create(): void {
    if (this.dataFormGroup.valid) {
      this.loading = true;

      let data;

      if (this.dataFormGroup.value['type'] === 'NATURAL') {
        data = {
          id: '',
          type: this.dataFormGroup.value['type'],
          name: this.dataFormGroup.value['name'],
          lastname: this.dataFormGroup.value['lastname'],
          displayName: this.dataFormGroup.value['name'] + ', ' + this.dataFormGroup.value['lastname'],
          address: this.dataFormGroup.value['address'],
          dni: this.dataFormGroup.value['dni'],
          phone: this.dataFormGroup.value['phone'],
          mail: this.dataFormGroup.value['mail'],
          regDate: Date.now(),
          createdBy: this.auth.userInteriores,
          editedBy: null,
          editedDate: null
        }
      } else {
        data = {
          id: '',
          type: this.dataFormGroup.value['type'],
          businessName: this.dataFormGroup.value['businessName'],
          businessAddress: this.dataFormGroup.value['businessAddress'],
          ruc: this.dataFormGroup.value['ruc'],
          businessPhone: this.dataFormGroup.value['businessPhone'],
          contacts: this.contactsList,
          regDate: Date.now(),
          createdBy: this.auth.userInteriores,
          editedBy: null,
          editedDate: null
        }
      }

      this.dbs.wholesaleCollection
        .add(data)
        .then(ref => {
          ref.update({ id: ref.id })
            .then(() => {
              this.loading = false;
              this.snackbar.open('Cliente mayorista creado!', 'Cerrar', {
                duration: 6000
              });
              this.dialogRef.close(true);
            })
            .catch(err => {
              this.loading = false;
              console.log(err);
              this.snackbar.open('Parece que hubo un error creando el nuevo cliente!', 'Cerrar', {
                duration: 6000
              });
            })
        })
    } else {
      this.snackbar.open('Debe completar el formulario!', 'Cerrar', {
        duration: 6000
      });
    }
  }
}
