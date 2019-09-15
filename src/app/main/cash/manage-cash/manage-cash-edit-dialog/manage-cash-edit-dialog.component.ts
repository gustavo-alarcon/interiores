import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Store, Cash, User } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { startWith, map, tap, debounceTime } from 'rxjs/operators';
import { ManageCashEditConfirmComponent } from '../manage-cash-edit-confirm/manage-cash-edit-confirm.component';
import { isObjectValidator } from 'src/app/core/is-object-validator';

@Component({
  selector: 'app-manage-cash-edit-dialog',
  templateUrl: './manage-cash-edit-dialog.component.html',
  styles: []
})
export class ManageCashEditDialogComponent implements OnInit, OnDestroy {

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
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ManageCashEditDialogComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { cash: Cash }
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
              if (find[0].name !== this.data.cash.name) {
                this.duplicate.nameLoading = false;
                this.duplicate.name = true;
                this.snackbar.open('Ya existe este nombre', 'Cerrar', {
                  duration: 4000
                });
              } else {
                this.duplicate.nameLoading = false;
              }

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
      name: [this.data.cash.name, [Validators.required]],
      location: [this.data.cash.location, [Validators.required, isObjectValidator]],
      supervisor: [this.data.cash.supervisor, [Validators.required, isObjectValidator]],
      password: [this.data.cash.password, [Validators.required]]
    })
  }

  showStore(store: Store): string | null {
    return store ? store.name : null;
  }

  showUser(user: User): string | null {
    return user ? user.displayName : null;
  }

  edit(): void {
    this.dialog.open(ManageCashEditConfirmComponent, {
      data: {
        cash: this.data.cash,
        form: this.dataFormGroup.value
      }
    }).afterClosed().subscribe(res => {
      if(res){
        this.dialogRef.close(true);
      }
    });
  }

}
