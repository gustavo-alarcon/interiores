import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { WholesaleCustomer, Customer, Cash, SerialNumber, Product, Document, SeparateProduct } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MatDialog, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { CheckStockSeparateDialogComponent } from '../../check-stock/check-stock-separate-dialog/check-stock-separate-dialog.component';
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { StoresCreateWholesaleDialogComponent } from '../stores-create-wholesale-dialog/stores-create-wholesale-dialog.component';
import { StoresCreateCustomerDialogComponent } from '../stores-create-customer-dialog/stores-create-customer-dialog.component';

@Component({
  selector: 'app-stores-separate-dialog',
  templateUrl: './stores-separate-dialog.component.html',
  styles: []
})
export class StoresSeparateDialogComponent implements OnInit, OnDestroy {

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
    private fb: FormBuilder,
    private af: AngularFirestore,
    private dialogRef: MatDialogRef<CheckStockSeparateDialogComponent>,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { serial: SerialNumber, product: Product }
  ) { }

  ngOnInit() {
    this.createForm();

    this.filteredDocuments =
      this.dataFormGroup.get('document').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
          map(name => name ? this.dbs.documents.filter(option => option.name.toLowerCase().includes(name)) : this.dbs.documents)
        )

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

    const paidImport$ =
      this.dataFormGroup.get('paidImport').valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(res => {
          if (res) {
            if (res < 0) {
              this.dataFormGroup.get('paidImport').setValue(0);
              this.snackbar.open('No puede asignar valores negativos', 'Cerrar', {
                duration: 3000
              });
            } else {
              const total = this.data.product.sale;

              if (res > total) {
                res = total;
                this.dataFormGroup.get('paidImport').setValue(res);
                this.snackbar.open('No puede asignar valores mayores al importe total', 'Cerrar', {
                  duration: 3000
                });
              }

              const indebt = total - res;
              this.dataFormGroup.get('indebtImport').setValue(parseFloat(indebt.toFixed(2)));
            }
          }
        });

    this.subscriptions.push(paidImport$);
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
      paidImport: [0, [Validators.required]],
      indebtImport: [this.data.product.sale, [Validators.required]],
      paymentType: [null, [Validators.required]],
      destinationAccount: null,
      cash: [null, [Validators.required, isObjectValidator]]
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
    this.dialog.open(StoresCreateWholesaleDialogComponent)
      .afterClosed().subscribe(res => {
        if (res) {
          this.dataFormGroup.get('customer').setValue(res);
        }
      });
  }

  addCustomer(): void {
    this.dialog.open(StoresCreateCustomerDialogComponent)
      .afterClosed().subscribe(res => {
        if (res) {
          this.dataFormGroup.get('customer').setValue(res);
        }
      });
  }

  separate(): void {
    if (this.dataFormGroup.valid) {
      this.loading = true;

      const store = this.dbs.stores.filter(option => option.name === this.data.serial.location);

      /**
       * SETTING REFERENCES
       * -Product
       * -Separate
       * -Cash
       */
      const productDocument =
        this.dbs.storesCollection
          .doc(store[0].id)
          .collection('products')
          .doc(this.data.product.id)
          .collection('products')
          .doc(this.data.serial.id);

      const separateReference =
        this.af.firestore.collection(this.dbs.separateProductsCollection.ref.path).doc();

      const cashCollection =
        this.dbs.cashListCollection
          .doc(this.dataFormGroup.value['cash'].id)
          .collection('openings')
          .doc(this.dataFormGroup.value['cash'].currentOpening)
          .collection('transactions');
      const cashTransactionReference =
        this.af.firestore.collection(cashCollection.ref.path).doc();

      try {
        this.af.firestore.runTransaction(t => {
          return t.get(productDocument.ref)
            .then(doc => {

              // ****************** READS AND PRE-SETS ********************
              // PRODUCT READ ********
              const status = doc.data().status;

              if (status === 'Vendido') {
                this.loading = false;
                this.snackbar.open(`El producto: ${this.data.product.name}#${this.data.serial.serie} ya fue vendido. Seleccione otro número de serie para continuar con la venta`, 'Cerrar', {
                  duration: 10000
                });
              } else {
                // PRODUCT **********
                const product = {
                  status: 'Separado',
                  customer: this.dataFormGroup.value['customer'],
                  separatePath: separateReference.path,
                  cashTransactionPath: cashTransactionReference.path,
                  separatedBy: this.auth.userInteriores,
                  separateDate: Date.now()
                };

                // SEPARATE *********
                const separate: SeparateProduct = {
                  id: separateReference.id,
                  documentName: this.dataFormGroup.value['document']['name'],
                  documentSerial: this.dataFormGroup.value['documentSerial'],
                  documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
                  customerType: this.dataFormGroup.value['customerType'],
                  customer: this.dataFormGroup.value['customer'],
                  serial: this.data.serial,
                  paidImport: this.dataFormGroup.value['paidImport'],
                  indebtImport: this.dataFormGroup.value['indebtImport'],
                  productPath: productDocument.ref.path,
                  cashTransactionPath: cashTransactionReference.path,
                  createdBy: this.auth.userInteriores,
                  regDate: Date.now(),
                  soldBy: null,
                  saleDate: null,
                  canceledBy: null,
                  cancelDate: null
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
                  type: 'SEPARADO',
                  description: this.dataFormGroup.value['document']['name']
                    + ', Serie ' + this.dataFormGroup.value['documentSerial']
                    + ', Correlativo ' + this.dataFormGroup.value['documentCorrelative']
                    + ', Tienda ' + this.data.serial.location
                    + ', Producto ' + this.data.serial.name + '#' + this.data.serial.serie
                    + ', Cliente ' + customerName,
                  import: this.dataFormGroup.value['paidImport'],
                  user: this.auth.userInteriores,
                  verified: false,
                  status: 'Grabado',
                  ticketType: 'SEPARADO',
                  paymentType: this.dataFormGroup.value['paymentType'],
                  expenseType: null,
                  departureType: null,
                  originAccount: null,
                  destinationAccount: this.dataFormGroup.value['destinationAccount'],
                  debt: this.dataFormGroup.value['indebtImport'],
                  separatePath: separateReference.path,
                  productPath: productDocument.ref.path,
                  lastEditBy: null,
                  lastEditUid: null,
                  lastEditDate: null,
                  approvedBy: null,
                  approvedByUid: null,
                  approvedDate: null,
                }

                // ******************* WRITE OPERATIONS ***********************
                t.update(productDocument.ref, product);
                t.set(separateReference, separate);
                t.set(cashTransactionReference, cashTransaction);
              }
            })
            .then(() => {
              this.loading = false;
              this.snackbar.open(`${this.data.serial.name} #${this.data.serial.serie} separado!`, 'Cerrar', {
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
      } catch (err) {
        this.loading = false;
        console.log(err);
        this.snackbar.open(`Ups!...parece que hubo un error, vuelva a preseionar el botón SEPARAR`, 'Cerrar', {
          duration: 6000
        });
      }
    }
  }

}
