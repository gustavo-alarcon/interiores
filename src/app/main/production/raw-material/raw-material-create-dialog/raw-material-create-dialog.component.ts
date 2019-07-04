import { Subscription, Observable } from 'rxjs';
import { Category, Unit } from './../../../../core/types';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { startWith, map, debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: 'app-raw-material-create-dialog',
  templateUrl: './raw-material-create-dialog.component.html',
  styles: []
})
export class RawMaterialCreateDialogComponent implements OnInit, OnDestroy {

  loading = false;

  dataFormGroup: FormGroup;

  duplicate = {
    name: false,
    nameLoading: false,
    code: false,
    codeLoading: false,
  }

  filteredCategories: Observable<Category[]>
  filteredUnits: Observable<Category[]>

  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    private dialogRef: MatDialogRef<RawMaterialCreateDialogComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

    this.filteredCategories = this.dataFormGroup.get('category').valueChanges
      .pipe(
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
        map(name => name ? this.dbs.categories.filter(option => option['name'].toLowerCase().includes(name)) : this.dbs.categories)
      );

    this.filteredUnits = this.dataFormGroup.get('unit').valueChanges
      .pipe(
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
        map(name => name ? this.dbs.units.filter(option => option['name'].toLowerCase().includes(name)) : this.dbs.units)
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
            const find = this.dbs.rawMaterials.filter(option => option.name === res && option.brand === this.dataFormGroup.value['brand']);

            if (find.length > 0) {
              this.duplicate.nameLoading = false;
              this.duplicate.name = true;
              this.snackbar.open('Ya existe este material en esta marca', 'Cerrar', {
                duration: 4000
              });
            } else {
              this.duplicate.nameLoading = false;
            }
          })
        ).subscribe()

    this.subscriptions.push(name$);

    const code$ =
      this.dataFormGroup.get('code').valueChanges
        .pipe(
          tap(() => {
            this.duplicate.codeLoading = true;
          }),
          debounceTime(500),
          tap(res => {

            this.duplicate.code = false;
            const find = this.dbs.rawMaterials.filter(option => option.code === res);

            if (find.length > 0) {
              this.duplicate.codeLoading = false;
              this.duplicate.code = true;
              this.snackbar.open('Código duplicado', 'Cerrar', {
                duration: 4000
              });
            } else {
              this.duplicate.codeLoading = false;
            }
          })
        ).subscribe()

    this.subscriptions.push(code$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      name: [null, [Validators.required]],
      code: [null, [Validators.required]],
      category: [null, [Validators.required]],
      brand: [null, [Validators.required]],
      stock: [null, [Validators.required]],
      unit: [null, [Validators.required]],
      purchase: [null, [Validators.required]],
      sale: [null, [Validators.required]],
    })
  }

  create(): void {
    if (this.dataFormGroup.valid) {

      this.loading = true;

      this.checkForNewCategory(this.dataFormGroup.value['category']);
      this.checkForNewUnit(this.dataFormGroup.value['unit']);

      const data = {
        id: '',
        regDate: Date.now()
      }

      const finalData = Object.assign(data, this.dataFormGroup.value);

      this.dbs.rawMaterialsCollection
        .add(finalData)
        .then(ref => {
          ref.update({ id: ref.id });
          this.loading = false;
          this.snackbar.open('Nuevo material creado!', 'Cerrar', {
            duration: 6000
          });
          this.dialogRef.close(true);
        })
        .catch(err => {
          this.loading = false;
          this.snackbar.open('Hubo un error grabando el documento', 'Cerrar', {
            duration: 6000
          });
          console.log(err);
        })
    }
  }

  checkForNewCategory(category: string): void {
    const ref = typeof category;
    if (ref === 'string') {
      const find = this.dbs.categories.filter(option => option.name === category);

      if (find.length === 0) {
        const data = {
          id: '',
          name: category,
          regDate: Date.now()
        }

        this.dbs.categoriesCollection
          .add(data)
          .then(ref => {
            ref.update({ id: ref.id });
            this.snackbar.open('Nueva categoría agregada!', 'Cerrar', {
              duration: 4000
            });
          })
          .catch(err => {
            this.snackbar.open('Error creando nueva categoría', 'Cerrar', {
              duration: 4000
            });
            console.log(err);
          })
      }
    }

  }

  checkForNewUnit(unit: string): void {
    const ref = typeof unit;
    if (ref === 'string') {
      const find = this.dbs.units.filter(option => option.name === unit);

      if (find.length === 0) {
        const data = {
          id: '',
          name: unit,
          regDate: Date.now()
        }

        this.dbs.unitsCollection
          .add(data)
          .then(ref => {
            ref.update({ id: ref.id });
            this.snackbar.open('Nueva unidad agregada!', 'Cerrar', {
              duration: 4000
            });
          })
          .catch(err => {
            this.snackbar.open('Error creando nueva unidad', 'Cerrar', {
              duration: 4000
            });
            console.log(err);
          })
      }
    }
  }

}
