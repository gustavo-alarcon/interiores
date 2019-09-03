import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Cash, SerialNumber, Product, Document, SeparateProduct, DepartureProduct } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { debounceTime, startWith, map } from 'rxjs/operators';
import { isObjectValidator } from 'src/app/core/is-object-validator';

@Component({
  selector: 'app-separate-products-sell-dialog',
  templateUrl: './separate-products-sell-dialog.component.html',
  styles: []
})
export class SeparateProductsSellDialogComponent implements OnInit, OnDestroy {

  loading: boolean = false;

  dataFormGroup: FormGroup;

  paymentTypes = [
    'TARJETA VISA',
    'TARJETA MASTERCARD',
    'TARJETA ESTILOS',
    'EFECTIVO',
    'TRANSFERENCIA'
  ]

  destinationAccounts = [
    'CUENTA SHIRLEY',
    'CUENTA INTERIORES',
    'CUENTA FERNANDO'
  ]

  filteredDocuments: Observable<Document[]>;

  filteredCash: Observable<Cash[]>;

  destinationAccountRequired: boolean = false;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    public fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<SeparateProductsSellDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { separateProduct: SeparateProduct },
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();

    this.dataFormGroup.get('price').valueChanges
      .pipe(
        debounceTime(1000)
      )
      .subscribe(res => {
        if (res) {
          let disc = 0;
          disc = 100 - (res * 100) / this.data.separateProduct.indebtImport;
          this.dataFormGroup.get('discount').setValue(disc.toFixed(2));
        }
      });

    this.filteredDocuments =
      this.dataFormGroup.get('document').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
          map(name => name ? this.dbs.documents.filter(option => option.name.toLowerCase().includes(name)) : this.dbs.documents)
        )

    // this.preFilteredCash = this.dbs.cashList.filter(option => option.location.name === this.data.serial.location);

    this.filteredCash =
      this.dataFormGroup.get('cash').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
          map(name => name ? this.dbs.cashList.filter(option => option.name.toLowerCase().includes(name)) : this.dbs.cashList)
        )

    const paymentType$ =
      this.dataFormGroup.get('paymentType').valueChanges
        .subscribe(res => {
          if (res === 'TRANSFERENCIA') {
            this.destinationAccountRequired = true;
          } else {
            this.destinationAccountRequired = false;
          }
        });

    this.subscriptions.push(paymentType$);

    const destinationAccount$ =
      this.dataFormGroup.get('destinationAccount').valueChanges
        .subscribe(res => {
          if (res) {
            this.destinationAccountRequired = false;
          } else {
            this.destinationAccountRequired = true;
          }
        });

    this.subscriptions.push(destinationAccount$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      document: [null, [Validators.required, isObjectValidator]],
      documentSerial: [null, [Validators.required]],
      documentCorrelative: [null, [Validators.required]],
      customerType: this.data.separateProduct.customerType ? this.data.separateProduct.customerType : '',
      customer: this.data.separateProduct.customer,
      price: [this.data.separateProduct.indebtImport, [Validators.required]],
      discount: [0, [Validators.required]],
      paymentType: [null, [Validators.required]],
      destinationAccount: null,
      cash: [null, [Validators.required, isObjectValidator]],
    });
  }

  showDocument(document: Document): string | null {
    return document ? document.name : null;
  }

  showCash(cash: Cash): string | null {
    return cash ? cash.name : null;
  }

  save(): void {
    if (this.dataFormGroup.valid) {
      this.loading = true;

      const store = this.dbs.stores.filter(option => option.name === this.data.separateProduct.serial.location);

      /**
       * SETTING REFERENCES
       * -Product
       * -Departure
       * -Cash
       * -SeparateProduct
       */
      const productReference =
        this.af.doc(this.data.separateProduct.productPath).ref;

      const departureReference =
        this.af.firestore.collection(this.dbs.departuresCollection.ref.path).doc();

      const cashCollection =
        this.dbs.cashListCollection
          .doc(this.dataFormGroup.value['cash'].id)
          .collection('openings')
          .doc(this.dataFormGroup.value['cash'].currentOpening)
          .collection('transactions');
      const cashTransactionReference =
        this.af.firestore.collection(cashCollection.ref.path).doc();

      const separateProductReference =
        this.dbs.separateProductsCollection
          .doc(this.data.separateProduct.id).ref;

      try {
        this.af.firestore.runTransaction(t => {
          return  t.get(productReference)
            .then(doc => {

              // ****************** READS AND PRE-SETS ********************
              // PRODUCT READ ********
              const status = doc.data().status;

              if (status === 'Vendido') {
                this.loading = false;
                this.snackbar.open(`El producto: ${this.data.separateProduct.serial.name}#${this.data.separateProduct.serial.serie} ya fue vendido. Cierre la ventana y escoja otro número de serie (Cambiar producto)`, 'Cerrar', {
                  duration: 10000
                });
                return;
              } else {
                // PRODUCT **********
                const product = {
                  status: 'Vendido',
                  customer: this.dataFormGroup.value['customer'],
                  departurePath: departureReference.path,
                  cashTransactionPath: cashTransactionReference.path,
                  soldBy: this.auth.userInteriores,
                  saleDate: Date.now()
                };

                // DEPARTURE *********
                const departure: DepartureProduct = {
                  id: '',
                  document: this.dataFormGroup.value['document'],
                  documentSerial: this.dataFormGroup.value['documentSerial'],
                  documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
                  product: null,
                  serie: this.data.separateProduct.serial.serie,
                  color: this.data.separateProduct.serial.color ? this.data.separateProduct.serial.color : null,
                  quantity: 1,
                  price: this.dataFormGroup.value['price'],
                  discount: (this.dataFormGroup.value['price'] / this.data.separateProduct.indebtImport) * 100,
                  paymentType: this.dataFormGroup.value['paymentType'],
                  destinationAccount: this.dataFormGroup.value['destinationAccount'],
                  customerType: this.dataFormGroup.value['customerType'],
                  customer: this.dataFormGroup.value['customer'],
                  source: 'check stock',
                  location: this.data.separateProduct.serial.location,
                  productPath: productReference.path,
                  cashTransactionPath: cashTransactionReference.path,
                  regDate: Date.now(),
                  createdBy: this.auth.userInteriores.displayName,
                  createdByUid: this.auth.userInteriores.uid,
                  canceledBy: '',
                  canceldByUid: '',
                  canceledDate: null
                }

                // CASH TRANSACTION **********
                let customerName;

                if (this.dataFormGroup.value['customer']['businessName']) {
                  customerName = this.dataFormGroup.value['customer']['businessName'];
                } else {
                  customerName = this.dataFormGroup.value['customer']['name'] + (this.dataFormGroup.value['customer']['lastname'] ? (' ' + this.dataFormGroup.value['customer']['lastname']) : '');
                }

                const cashTransaction = {
                  id: '',
                  regDate: Date.now(),
                  type: 'VENTA',
                  description: this.dataFormGroup.value['document']['name']
                    + ', Serie ' + this.dataFormGroup.value['documentSerial']
                    + ', Correlativo ' + this.dataFormGroup.value['documentCorrelative']
                    + ', Tienda ' + this.data.separateProduct.serial.location
                    + ', Producto ' + this.data.separateProduct.serial.name + '#' + this.data.separateProduct.serial.serie
                    + ', Cliente ' + customerName
                    + ', Dsct.  ' + this.dataFormGroup.value['discount'] + '%',
                  import: this.dataFormGroup.value['price'],
                  user: this.auth.userInteriores,
                  verified: false,
                  status: 'Grabado',
                  ticketType: 'VENTA',
                  paymentType: this.dataFormGroup.value['paymentType'],
                  expenseType: null,
                  departureType: null,
                  originAccount: null,
                  destinationAccount: this.dataFormGroup.value['destinationAccount'],
                  debt: 0,
                  departurePath: departureReference.path,
                  productPath: productReference.path,
                  lastEditBy: null,
                  lastEditUid: null,
                  lastEditDate: null,
                  approvedBy: null,
                  approvedByUid: null,
                  approvedDate: null,
                }

                // ******************* WRITE OPERATIONS ***********************
                t.update(productReference, product);
                t.set(departureReference, departure);
                t.set(cashTransactionReference, cashTransaction);
                t.delete(separateProductReference);


              }
            });
        })
          .then(() => {
            this.loading = false;
            this.snackbar.open(`${this.data.separateProduct.serial.name} #${this.data.separateProduct.serial.serie} vendido!`, 'Cerrar', {
              duration: 6000
            });
            this.dialogRef.close(true);
          })
          .catch(err => {
            this.loading = false;
            console.log(err);
            this.snackbar.open(`Ups!...parece que hubo un error en la transacción`, 'Cerrar', {
              duration: 6000
            });
          })
      } catch (err) {
        this.loading = false;
        console.log(err);
        this.snackbar.open(`Ups!...parece que hubo un error, vuelva a presionar el botón VENDER`, 'Cerrar', {
          duration: 6000
        });
      }
    }
  }

}
