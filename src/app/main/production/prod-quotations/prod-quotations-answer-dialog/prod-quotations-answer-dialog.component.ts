import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Quotation } from 'src/app/core/types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-prod-quotations-answer-dialog',
  templateUrl: './prod-quotations-answer-dialog.component.html',
  styles: []
})
export class ProdQuotationsAnswerDialogComponent implements OnInit {

  loading: boolean = false;

  dataFormGroup: FormGroup;

  selectedFile5 = null;

  minDate: Date = new Date();

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private storage: AngularFireStorage,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { quote: Quotation },
    private dialogRef: MatDialogRef<ProdQuotationsAnswerDialogComponent>
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      recommendations: [null, [Validators.required]],
      import: [null, [Validators.required]],
      proposedDate: [null, [Validators.required]]
    });
  }

  answer(): void {
    if (this.dataFormGroup.valid) {
      this.loading = true;
      
      this.dbs.quotationsCollection
        .doc(this.data.quote.id)
        .update({
          status: 'Respondida',
          recommendations: this.dataFormGroup.value['recommendations'],
          import: this.dataFormGroup.value['import'],
          proposedDate: this.dataFormGroup.value['proposedDate'].valueOf(),
          approvedBy: this.auth.userInteriores.displayName,
          approvedByUid: this.auth.userInteriores.uid,
          approvedDate: Date.now()
        })
        .then(() => {
          if (this.selectedFile5) {
            const file = this.selectedFile5;
            const filePath = `/Cotizaciones/PDF/${Date.now()}_${file.name}`;
            const fileRef = this.storage.ref(filePath);
            const task = this.storage.upload(filePath, file);

            task.snapshotChanges().pipe(
              finalize(() => {
                const downloadURL = fileRef.getDownloadURL();

                downloadURL.subscribe(url => {
                  if (url) {
                    this.dbs.quotationsCollection
                      .doc(this.data.quote.id)
                      .update({ quotationPDF: url })
                      .then(() => {
                        this.loading = false;
                        this.snackbar.open(`Cotización #${this.data.quote.correlative} RESPONDIDA`, 'Cerrar', {
                          duration: 10000
                        });
                        this.dialogRef.close(true);
                      })
                  }
                })
              })
            )
              .subscribe()
          } else {
            this.loading = false;
            this.snackbar.open(`Cotización #${this.data.quote.correlative} RESPONDIDA`, 'Cerrar', {
              duration: 10000
            });
            this.dialogRef.close(true);
          }
        })
        .catch(err => {
          this.loading = false;
          this.snackbar.open(`Hubo un error respondiendo la cotización #${this.data.quote.correlative}`, 'Cerrar', {
            duration: 10000
          });
          console.log(err);
        });
    }
  }

  onFileSelected5(event): void {
    if (event.target.files[0].type === 'application/pdf') {
      this.selectedFile5 = event.target.files[0];
    } else {
      this.snackbar.open("Seleccione un archivo PDF", "Cerrar", {
        duration: 6000
      })
    }
  }

}
