import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { SeparateProduct, Cash, Transaction, CreditNote } from 'src/app/core/types';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { startWith, map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-separate-products-cancel-confirm',
  templateUrl: './separate-products-cancel-confirm.component.html',
  styles: []
})
export class SeparateProductsCancelConfirmComponent implements OnInit, OnDestroy {

  loading: boolean = false;

  flags = {
    canceled: false
  }

  dataFormGroup: FormGroup;

  filteredCashList: Observable<Cash[]>;

  paymentApproved: boolean = false;
  cashRequired: boolean = false;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<SeparateProductsCancelConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { separateProduct: SeparateProduct }
  ) { }

  ngOnInit() {
    this.createForm();

    this.filteredCashList =
      this.dataFormGroup.get('cash').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
          map(name => name ? this.dbs.cashList.filter(option => option.name.toLowerCase().includes(name)) : this.dbs.cashList)
        );

    this.af.doc<Transaction>(this.data.separateProduct.cashTransactionPath)
      .valueChanges()
      .subscribe(res => {
        if (res.status === 'Aprobado') {
          this.paymentApproved = true;
        } else {
          this.paymentApproved = false;
        }
      });

    const cancellationReturnType$ =
      this.dataFormGroup.get('cancellationReturnType').valueChanges
        .subscribe(res => {
          if (res === 'DEVOLUCION') {
            this.cashRequired = true;
          } else {
            this.cashRequired = false;
          }
        });

    this.subscriptions.push(cancellationReturnType$);

    const cash$ =
      this.dataFormGroup.get('cash').valueChanges
        .subscribe(res => {
          if (res.name) {
            this.cashRequired = false;
          } else {
            this.cashRequired = true;
          }
        });

    this.subscriptions.push(cash$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      cancellationReturnType: [null, [Validators.required]],
      cash: null
    })
  }

  showCash(cash: Cash): string | null {
    return cash ? cash.name : null;
  }

  cancel(): void {

    if (this.dataFormGroup.valid && !this.cashRequired) {

      this.loading = true;

      const separateProductReference =
        this.dbs.separateProductsCollection.doc(this.data.separateProduct.id).ref;

      const productReference = this.af.doc(this.data.separateProduct.productPath).ref;
      // let transactionDocument: DocumentReference;
      let creditNoteDocument: DocumentReference;

      if (this.dataFormGroup.value['cancellationReturnType'] === 'DEVOLUCION') {
        // transactionDocument =
        //   this.af.firestore.collection(this.dbs.cashListCollection
        //     .doc(this.dataFormGroup.value['cash'].id)
        //     .collection('openings')
        //     .doc(this.dataFormGroup.value['cash'].currentOpening)
        //     .collection('transactions').ref.path).doc();
      } else {
        creditNoteDocument =
          this.af.firestore.collection(this.dbs.creditNotesCollection.ref.path).doc();
      }

      try {
        this.af.firestore.runTransaction(t => {
          return t.get(productReference)
            .then(doc => {

              const status = doc.data().status;

              if (status === 'Separado') {

                const productData = {
                  status: 'Acabado',
                  modifiedBy: this.auth.userInteriores,
                  modifiedDate: Date.now(),
                  separatedBy: null,
                  separatedDate: null
                }

                // let transactionData: Transaction;
                let creditNoteData: CreditNote;

                if (this.dataFormGroup.value['cancellationReturnType'] === 'DEVOLUCION') {
                  // transactionData = {
                  //   id: transactionDocument.id,
                  //   regDate: Date.now(),
                  //   type: 'DEVOLUCION',
                  //   description: `Devolución por cancelación de separación, 
                  //               Documento de separación: ${this.data.separateProduct.documentName}-${this.data.separateProduct.documentSerial}-${this.data.separateProduct.documentCorrelative}, 
                  //               Tienda: ${this.data.separateProduct.serial.location}, 
                  //               Producto: ${this.data.separateProduct.serial.name}(${this.data.separateProduct.serial.code})#${this.data.separateProduct.serial.serie}`,
                  //   import: this.data.separateProduct.paidImport,
                  //   user: this.auth.userInteriores,
                  //   verified: false,
                  //   status: 'Grabado',
                  //   ticketType: null,
                  //   paymentType: 'EFECTIVO',
                  //   expenseType: null,
                  //   departureType: 'DEVOLUCION',
                  //   originAccount: null,
                  //   debt: 0,
                  //   lastEditBy: null,
                  //   lastEditUid: null,
                  //   lastEditDate: null,
                  //   approvedBy: null,
                  //   approvedByUid: null,
                  //   approvedDate: null
                  // }

                  // t.set(transactionDocument, transactionData);
                } else {
                  creditNoteData = {
                    id: creditNoteDocument.id,
                    documentName: this.data.separateProduct.documentName,
                    documentSerial: this.data.separateProduct.documentSerial,
                    documentCorrelative: this.data.separateProduct.documentCorrelative,
                    customer: this.data.separateProduct.customer,
                    serial: this.data.separateProduct.serial,
                    returnImport: this.data.separateProduct.paidImport,
                    status: 'Pendiente',
                    separateProductPath: separateProductReference.path,
                    separateTransactionPath: this.data.separateProduct.cashTransactionPath,
                    productPath: this.data.separateProduct.productPath,
                    regDate: Date.now(),
                    createdBy: this.auth.userInteriores,
                  }

                  t.set(creditNoteDocument, creditNoteData);
                }

                t.update(productReference, productData);
                t.delete(separateProductReference);
              }
            })
        })
        .then(() => {
          this.loading = false;
          this.flags.canceled = true;
          this.snackbar.open('Separación cancelada!','Cerrar', {
            duration: 6000
          });
          this.dialogRef.close(true);
        })

      } catch (error) {
        console.log(error);
        this.snackbar.open('Parece que hubo un error ejecuntado la transacción!', 'Cerrar', {
          duration: 6000
        });
        this.loading = false;
      }

    } else {
      this.snackbar.open('Debes seleccionar la caja que aprobará la devolución del dinero!', 'Cerrar', {
        duration: 6000
      });
    }


  }

}
