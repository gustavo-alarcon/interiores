import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store, User } from 'src/app/core/types';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { AuthService } from 'src/app/core/auth.service';
import { startWith, map, tap, debounceTime } from 'rxjs/operators';
import { isObjectValidator } from 'src/app/core/is-object-validator';

@Component({
  selector: 'app-manage-cash-create-dialog',
  templateUrl: './manage-cash-create-dialog.component.html',
  styles: []
})
export class ManageCashCreateDialogComponent implements OnInit, OnDestroy {

  loading = false;

  dataFormGroup: FormGroup;

  duplicate = {
    name: false,
    nameLoading: false
  }

  filteredStores: Observable<Store[]>
  filteredUsers: Observable<User[]>

  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<ManageCashCreateDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

    this.filteredStores = this.dataFormGroup.get('location').valueChanges
      .pipe(
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
        map(name => name ? this.dbs.stores.filter(option => option.name.toLowerCase().includes(name)) : this.dbs.stores)
      );

    this.filteredUsers = this.dataFormGroup.get('supervisor').valueChanges
      .pipe(
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.displayName.toLowerCase()),
        map(name => name ? this.dbs.users.filter(option => option.displayName.toLowerCase().includes(name)) : this.dbs.users)
      );

    const name$ =
      this.dataFormGroup.get('name').valueChanges
        .pipe(
          tap(() => {
            this.duplicate.nameLoading = true;
          }),
          debounceTime(500),
          tap(res => {

            this.duplicate.name = false;
            const find = this.dbs.cashList.filter(option => option.name === res);

            if (find.length > 0) {
              this.duplicate.nameLoading = false;
              this.duplicate.name = true;
              this.snackbar.open('Ya existe este nombre', 'Cerrar', {
                duration: 4000
              });
            } else {
              this.duplicate.nameLoading = false;
            }
          })
        ).subscribe()

    this.subscriptions.push(name$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      name: [null, [Validators.required]],
      location: [null, [Validators.required, isObjectValidator]],
      supervisor: [null, [Validators.required, isObjectValidator]],
      password: [null, [Validators.required]]
    })
  }

  showStore(store: Store): string | null {
    return store ? store.name : null;
  }

  showUser(user: User): string | null {
    return user ? user.displayName : null;
  }

  create(): void {
    if (this.dataFormGroup.valid) {

      this.loading = true;

      const data = {
        id: '',
        name: this.dataFormGroup.value['name'].trim(),
        location: this.dataFormGroup.value['location'],
        supervisor: this.dataFormGroup.value['supervisor'],
        password: this.dataFormGroup.value['password'].trim(),
        lastOpening: null,
        lastClosure: null,
        currentOwner: null,
        open: false,
        createdBy: this.auth.userInteriores.displayName,
        createdByUid: this.auth.userInteriores.uid,
        regDate: Date.now(),
        lastEditBy: null,
        lastEditByUid: null,
        lastEditDate: null
      }

      this.dbs.cashListCollection
        .add(data)
        .then(ref => {
          ref.update({ id: ref.id });
          this.loading = false;
          this.snackbar.open('Nueva caja creada!', 'Cerrar', {
            duration: 6000
          });
          this.dialogRef.close(true);
        })
        .catch(err => {
          this.loading = false;
          this.snackbar.open('Hubo un error creando la caja', 'Cerrar', {
            duration: 6000
          });
          console.log(err);
        })
    }
  }

}
