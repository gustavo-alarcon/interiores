import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar, MatDialog } from '@angular/material';
import { Product, SerialNumber, Departure, Document, Cash, WholesaleCustomer, Customer } from 'src/app/core/types';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { CheckStockCreateWholesaleDialogComponent } from '../check-stock-create-wholesale-dialog/check-stock-create-wholesale-dialog.component';
import { CheckStockCreateCustomerDialogComponent } from '../check-stock-create-customer-dialog/check-stock-create-customer-dialog.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { firestore } from 'firebase';

@Component({
  selector: 'app-check-stock-sell-dialog',
  templateUrl: './check-stock-sell-dialog.component.html',
  styles: []
})
export class CheckStockSellDialogComponent implements OnInit, OnDestroy {

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
  filteredCustomers: Observable<WholesaleCustomer[] | Customer[]>;
  filteredCash: Observable<Cash[]>;
  // preFilteredCash: Array<Cash> = [];

  destinationAccountRequired: boolean = false;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    public fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CheckStockSellDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serial: SerialNumber, product: Product },
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
          disc = 100 - (res * 100) / this.data.product.sale;
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

    const customerType$ =
      this.dataFormGroup.get('customerType').valueChanges
        .subscribe(res => {
          if (res === 'MAYORISTA') {
            this.dataFormGroup.get('customer').reset();
            this.filteredCustomers =
              this.dataFormGroup.get('customer').valueChanges
                .pipe(
                  startWith<any>(''),
                  map(value => {
                    if (value) {
                      return typeof value === 'string' ? value.trim().toLowerCase() : (value.businessName ? value.businessName.toLowerCase() : value.name.toLowerCase())
                    } else {
                      return '';
                    }
                  }),
                  map(name => name ? this.dbs.wholesale.filter(option => (option.businessName ? option.businessName.toLowerCase().includes(name) : false) || (option.name ? option.name.toLowerCase().includes(name) : false)) : this.dbs.wholesale)
                )
          } else if (res === 'GENERAL') {
            this.dataFormGroup.get('customer').reset();
            this.filteredCustomers =
              this.dataFormGroup.get('customer').valueChanges
                .pipe(
                  startWith<any>(''),
                  map(value => {
                    if (value) {
                      return typeof value === 'string' ? value.trim().toLowerCase() : (value.businessName ? value.businessName.toLowerCase() : value.name.toLowerCase())
                    } else {
                      return '';
                    }
                  }),
                  map(name => name ? this.dbs.customers.filter(option => (option.businessName ? option.businessName.toLowerCase().includes(name) : false) || (option.name ? option.name.toLowerCase().includes(name) : false)) : this.dbs.customers)
                )
          }
        });

    this.subscriptions.push(customerType$);

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
      customerType: [null, [Validators.required]],
      customer: [null, [Validators.required, isObjectValidator]],
      price: [null, [Validators.required]],
      discount: [0, [Validators.required]],
      paymentType: [null, [Validators.required]],
      destinationAccount: null,
      cash: [null, [Validators.required, isObjectValidator]],
    });
  }

  showDocument(document: Document): string | null {
    return document ? document.name : null;
  }

  showCustomer(customer: any): string | null {
    if (customer) {
      if (customer.businessName) {
        return customer.businessName;
      } else if (customer.name) {
        return customer.name + (customer.lastname ? (' ' + customer.lastname) : '');
      }
    } else {
      return null;
    }

  }

  showCash(cash: Cash): string | null {
    return cash ? cash.name : null;
  }

  addWholesale(): void {
    this.dialog.open(CheckStockCreateWholesaleDialogComponent)
      .afterClosed().subscribe(res => {
        if (res) {
          this.dataFormGroup.get('customer').setValue(res);
        }
      });
  }

  addCustomer(): void {
    this.dialog.open(CheckStockCreateCustomerDialogComponent)
      .afterClosed().subscribe(res => {
        if (res) {
          this.dataFormGroup.get('customer').setValue(res);
        }
      });
  }

  save(): void {
    if (this.dataFormGroup.valid) {
      this.loading = true;

      const store = this.dbs.stores.filter(option => option.name === this.data.serial.location);

      /**
       * SETTING REFERENCES
       * -Product
       * -Serial
       * -Departure
       * -Cash
       */
      const productReference =
        this.dbs.storesCollection
          .doc(store[0].id)
          .collection('products')
          .doc(this.data.product.id);

      const serialReference =
        this.dbs.storesCollection
          .doc(store[0].id)
          .collection('products')
          .doc(this.data.product.id)
          .collection('products')
          .doc(this.data.serial.id);

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

      const decrement = firestore.FieldValue.increment(-1);

      // try {
      this.af.firestore.runTransaction(t => {
        return t.get(serialReference.ref)
          .then(doc => {

            // ****************** READS AND PRE-SETS ********************
            // PRODUCT READ ********
            const status = doc.data().status;
            // HERE WE HAVE TO CHECK FOR MULTIPLE GETS !!!! ALSO IN THE STORE FUNCTION TO SELL

            if (status === 'Vendido') {
              this.loading = false;
              this.snackbar.open(`El producto: ${this.data.product.name}#${this.data.serial.serie} ya fue vendido. Seleccione otro número de serie para continuar con la venta`, 'Cerrar', {
                duration: 10000
              });
              return Promise.reject(`El producto: ${this.data.product.name}#${this.data.serial.serie} ya fue vendido. Seleccione otro número de serie para continuar con la venta`)

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
              const departure: Departure = {
                id: '',
                document: this.dataFormGroup.value['document'],
                documentSerial: this.dataFormGroup.value['documentSerial'],
                documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
                product: this.data.product,
                serie: this.data.serial.serie,
                color: this.data.serial.color ? this.data.serial.color : null,
                quantity: 1,
                price: this.dataFormGroup.value['price'],
                discount: this.dataFormGroup.value['discount'],
                paymentType: this.dataFormGroup.value['paymentType'],
                destinationAccount: this.dataFormGroup.value['destinationAccount'],
                customerType: this.dataFormGroup.value['customerType'],
                customer: this.dataFormGroup.value['customer'],
                source: 'check stock',
                location: this.data.serial.location,
                productPath: serialReference.ref.path,
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
                  + ', Tienda ' + this.data.serial.location
                  + ', Producto ' + this.data.serial.name + '#' + this.data.serial.serie
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
                productPath: serialReference.ref.path,
                lastEditBy: null,
                lastEditUid: null,
                lastEditDate: null,
                approvedBy: null,
                approvedByUid: null,
                approvedDate: null,
              }

              // ******************* WRITE OPERATIONS ***********************
              t.update(productReference.ref, { stock: decrement });
              t.update(serialReference.ref, product);
              t.set(departureReference, departure);
              t.set(cashTransactionReference, cashTransaction);
            }
          })
          .then(() => {
            this.loading = false;
            this.snackbar.open(`${this.data.serial.name} #${this.data.serial.serie} vendido!`, 'Cerrar', {
              duration: 6000
            });
            this.dialogRef.close(true);
          })
          .catch(err => {
            this.loading = false;
            console.log(err);
            this.snackbar.open(`Parece que hubo un problema!`, 'Cerrar', {
              duration: 6000
            });
          })
      })
      // } catch (err) {
      //   this.loading = false;
      //   console.log(err);
      //   this.snackbar.open(`Ups!...parece que hubo un error, vuelva a preseionar el botón VENDER`, 'Cerrar', {
      //     duration: 6000
      //   });
      // }
    }
  }

}
