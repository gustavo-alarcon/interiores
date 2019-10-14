import { Color } from './../../../../core/types';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Category } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar, MatDialog } from '@angular/material';
import { startWith, map, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth.service';
import { FinishedProductsCreateConfirmComponent } from '../finished-products-create-confirm/finished-products-create-confirm.component';
import { Ng2ImgMaxService } from 'ng2-img-max';

@Component({
  selector: 'app-finished-products-create-dialog',
  templateUrl: './finished-products-create-dialog.component.html',
  styles: []
})
export class FinishedProductsCreateDialogComponent implements OnInit, OnDestroy {

  loading = false;

  dataFormGroup: FormGroup;

  duplicate = {
    name: false,
    nameLoading: false,
    code: false,
    codeLoading: false,
  }

  filteredCategories: Observable<Category[]>

  selectedFile1 = null;
  imageSrc1: string | ArrayBuffer;
  resizingImage1: boolean = false;

  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<FinishedProductsCreateDialogComponent>,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private ng2ImgMax: Ng2ImgMaxService
  ) { }

  ngOnInit() {
    this.createForm();

    this.filteredCategories = this.dataFormGroup.get('category').valueChanges
      .pipe(
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
        map(name => name ? this.dbs.categories.filter(option => option['name'].toLowerCase().includes(name) && option.source === 'product') : this.dbs.categories)
      );

    const name$ =
      this.dataFormGroup.get('name').valueChanges
        .pipe(
          // Take values that are different between them
          distinctUntilChanged(),
          // Initialize duplicate name as true
          tap(() => {
            this.duplicate.nameLoading = true;
          }),
          // Waits for 500 milliseconds before processing the input
          debounceTime(500),
          // Cuts the initial and final whitespaces
          map(res => {
            return res.trim().replace(/\s+/g, " ");
          }),
          // Looking for duplicated names
          tap(res => {

            this.duplicate.name = false;
            const find = this.dbs.finishedProducts.filter(option => option.name === res);

            if (find.length > 0) {
              this.duplicate.nameLoading = false;
              this.duplicate.name = true;
              this.snackbar.open('Nombre duplicado', 'Cerrar', {
                duration: 4000
              });
            } else {
              this.duplicate.nameLoading = false;
            }

            this.dataFormGroup.get('name').setValue(res);
          })
        ).subscribe()

    this.subscriptions.push(name$);

    const code$ =
      this.dataFormGroup.get('code').valueChanges
        .pipe(
          // Take values that are different between them
          distinctUntilChanged(),
          // Initialize duplicate code as true
          tap(() => {
            this.duplicate.codeLoading = true;
          }),
          // Waits for 500 milliseconds before processing the input
          debounceTime(500),
          // Cuts the initial and final whitespaces
          map(res => {
            return res.trim().replace(/\s/g, "");
          }),
          // Looking for duplicated codes
          tap(res => {

            this.duplicate.code = false;
            const find = this.dbs.finishedProducts.filter(option => option.code === res);

            if (find.length > 0) {
              this.duplicate.codeLoading = false;
              this.duplicate.code = true;
              this.snackbar.open('Código duplicado', 'Cerrar', {
                duration: 4000
              });
            } else {
              this.duplicate.codeLoading = false;
            }

            this.dataFormGroup.get('code').setValue(res);
          })
        ).subscribe()

    this.subscriptions.push(code$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      code: [null, [Validators.required]],
      name: [null, [Validators.required]],
      correlative: [null, [Validators.required]],
      stock: [null, [Validators.required]],
      category: [null, [Validators.required]],
      description: [null, [Validators.required]],
      sale: [null, [Validators.required]],
    })
  }

  onFileSelected1(event): void {
    if (event.target.files[0].type === 'image/png' || event.target.files[0].type === 'image/jpeg') {

      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.imageSrc1 = reader.result;

        reader.readAsDataURL(file);
      }

      this.resizingImage1 = true;
      this.ng2ImgMax.resizeImage(event.target.files[0], 10000, 800).subscribe(
        result => {
          this.selectedFile1 = new File([result], result.name);
          console.log('Oh si!');
          this.resizingImage1 = false;
        },
        error => {
          console.log('😢 Oh no!', error);
          this.resizingImage1 = false;
        }
      );

    } else {
      this.snackbar.open("Seleccione una imagen en formato png o jpeg", "Cerrar", {
        duration: 6000
      })
    }

  }

  create(): void {
    if (this.dataFormGroup.valid) {
      this.dialog.open(FinishedProductsCreateConfirmComponent, {
        data: {
          form: this.dataFormGroup.value,
          image: this.selectedFile1
        }
      }).afterClosed().subscribe(res => {
        if (res) {
          this.dialogRef.close(true);
        }
      })

    }
  }

}
