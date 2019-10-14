import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { MatSnackBar, MatDialogRef } from '@angular/material';
import { AuthService } from 'src/app/core/auth.service';
import { Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-finished-products-create-confirm',
  templateUrl: './finished-products-create-confirm.component.html',
  styles: []
})
export class FinishedProductsCreateConfirmComponent implements OnInit {

  uploading: boolean = false;

  uploadPercent1: Observable<number>;
  uploading1: boolean = false;

  flags = {
    created: false,
    image: false,
    serie: false
  }

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private storage: AngularFireStorage,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<FinishedProductsCreateConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { form: any, image: any }
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  save(): void {
    this.uploading = true;

    this.checkForNewCategory(this.data['form']['category']);

    const data = {
      id: '',
      initialStock: this.data['form']['stock'],
      regDate: Date.now(),
      createdBy: this.auth.userInteriores.displayName,
      createdByUid: this.auth.userInteriores.uid,
      lastUpdateBy: '',
      lastUpdateByUid: '',
      lastUpdateDate: null
    }

    const finalData = Object.assign(data, this.data['form']);

    this.dbs.finishedProductsCollection
      .add(finalData)
      .then(ref => {
        this.flags.created = true;
        const initSerie = this.data['form']['correlative'];
        const finalSerie = initSerie + this.data['form']['stock'] - 1;
        ref.update({ id: ref.id, correlative: finalSerie })
          .then(() => {

            this.flags.created = true;

            for (let serie = initSerie; serie <= finalSerie; serie++) {
              ref.collection('products')
                .add(
                  {
                    id: '',
                    productId: ref.id,
                    name: this.data['form']['name'],
                    code: this.data['form']['code'],
                    serie: serie,
                    color: '',
                    status: 'Acabado',
                    location: 'Productos acabados',
                    regDate: Date.now(),
                    createdBy: this.auth.userInteriores.displayName,
                    createdByUid: this.auth.userInteriores.uid,
                    modifiedBy: '',
                    modifiedByUid: '',
                    customerDisplayName: '',
                    customerDocumentNumber: '',
                    customerDate: null
                  }
                ).then(refSerie => {
                  refSerie.update({ id: refSerie.id })
                }).catch(err => {
                  this.uploading = false;
                  this.snackbar.open('Hubo un error creando los números de serie', 'Cerrar', {
                    duration: 6000
                  });
                  console.log(err);
                })
            }

            this.uploading = false;
            this.flags.serie = true;
            this.snackbar.open('Nuevo producto creado!', 'Cerrar', {
              duration: 6000
            });
            this.dialogRef.close(true);

            if (this.data.image) {
              this.uploading1 = true;
              const file = this.data.image;
              const filePath = `/Productos acabados/${Date.now()}_${file.name}`;
              const fileRef = this.storage.ref(filePath);
              const task = this.storage.upload(filePath, file);

              this.uploadPercent1 = task.percentageChanges();

              task.snapshotChanges().pipe(
                finalize(() => {
                  const downloadURL = fileRef.getDownloadURL();

                  downloadURL.subscribe(url => {
                    if (url) {

                      ref.update({ image: url })
                        .then(() => {
                          this.flags.image = true;
                        })
                        .catch(err => {
                          console.log(err);
                          this.dialogRef.close(true);
                          this.snackbar.open('Hubo un error agregando los números de serie!', 'Cerrar', {
                            duration: 6000
                          });
                        })
                    }
                  })
                })
              )
                .subscribe()
            } else {
              this.uploading = false;
              this.flags.serie = true;
              this.snackbar.open('Nuevo producto creado!', 'Cerrar', {
                duration: 6000
              });
              this.dialogRef.close(true);
            }

          })

      })
      .catch(err => {
        this.uploading = false;
        this.snackbar.open('Hubo un error grabando el documento', 'Cerrar', {
          duration: 6000
        });
        console.log(err);
      })
  }

  checkForNewCategory(category: string): void {
    const ref = typeof category;
    if (ref === 'string') {
      const find = this.dbs.categories.filter(option => option.name === category);

      if (find.length === 0) {
        const data = {
          id: '',
          name: category,
          source: 'product',
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
}
