import { Component, OnInit, ViewChild } from '@angular/core';
import { Provider, RawMaterial } from 'src/app/core/types';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar, MatDialog, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { startWith, map, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { PurchasesRegisterAddProviderDialogComponent } from '../purchases-register-add-provider-dialog/purchases-register-add-provider-dialog.component';
import { PurchasesRegisterEditItemDialogComponent } from '../purchases-register-edit-item-dialog/purchases-register-edit-item-dialog.component';
import { PurchasesRegisterAddRawDialogComponent } from '../purchases-register-add-raw-dialog/purchases-register-add-raw-dialog.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-purchases-register-create-dialog',
  templateUrl: './purchases-register-create-dialog.component.html',
  styles: []
})
export class PurchasesRegisterCreateDialogComponent implements OnInit {

  loading = false;

  isRawMaterial = new FormControl(false);
  detractionApplies = new FormControl(false);

  dataFormGroup: FormGroup;
  itemFormGroup: FormGroup;

  filteredProviders: Observable<Provider[]>;
  filteredRawMaterials: Observable<RawMaterial[]>;

  documentTypes = [
    'FACTURA',
    'BOLETA',
    'RECIBO POR HONORARIOS',
    'TICKET'
    // 'Recibo por honorarios electrónico',
    // 'Factura electrónica',
    // 'Boleta electrónica',
    // 'Nota de crédito de RHE electrónica',
    // 'Nota de crédito electrónica boleta',
    // 'Nota de débito electrónica boleta',
    // 'Nota de crédito electrónica factura',
    // 'Nota de débito electrónica factura',
    // 'Guia de remisión remitente - bienes fiscalizables',
    // 'Guía de remisión remitente complementaria - bienes fiscalizables',
    // 'Guia de remisión transportista - bienes fiscalizables',
    // 'Guia de remisión transportista complementaría - bienes fiscalizables',
    // 'Ticket POS',
    // 'Ticket ME',
    // 'Nota de crédito ME',
    // 'Envío resumen factura',
    // 'Envío resumen boleta',
    // 'Envío resumen nota de crédito',
    // 'Envío resumen nota de débito',
    // 'Envío resumen ticket',
    // 'Comprobante de retención',
    // 'Comprobante de percepción'
  ];

  displayedColumns: string[] = ['index', 'item', 'quantity', 'import', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  duplicates = {
    correlative: false,
    correlativeLoading: false
  }

  providerSelected: boolean = false;
  provider: Provider = {
    id: '',
    name: '',
    ruc: 0,
    address: '',
    phone: '',
    createdBy: '',
    createdByUid: '',
    regDate: 0
  };

  itemsList = [];
  currentItem: any;

  paymentTypes = [
    'EFECTIVO',
    'CREDITO',
    'TARJETA'
  ];

  subtotalImportRequired: boolean = false;
  igvImportRequired: boolean = false;
  creditDateRequired: boolean = false;

  detractionPercentageRequired: boolean = false;
  detractionImportRequired: boolean = false;
  detractionDateRequired: boolean = false;

  transactionObservable = new BehaviorSubject<boolean>(null);
  dataTransactionObservable = this.transactionObservable.asObservable();
  transactionCounter = 0;
  transactionDone: boolean = false;

  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog,
    private af: AngularFirestore,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<PurchasesRegisterCreateDialogComponent>

  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.createForm();
    this.createItemForm();

    this.filteredProviders =
      this.dataFormGroup.get('provider').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.ruc.toString()),
          map(value => value ? this.dbs.providers.filter(option => option.ruc.toString().includes(value) || option.name.toLowerCase().includes(value)) : this.dbs.providers)
        );

    this.filteredRawMaterials =
      this.itemFormGroup.get('item').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
          map(value => value ? this.dbs.rawMaterials.filter(option => option.name.toLowerCase().includes(value) || option.code.toLowerCase().includes(value)) : this.dbs.rawMaterials)
        );

    const documentTypeSub =
      this.dataFormGroup.get('documentType').valueChanges
        .subscribe(res => {
          if (res === 'FACTURA') {
            this.subtotalImportRequired = true;
            this.igvImportRequired = true;
          } else {
            this.subtotalImportRequired = false;
            this.igvImportRequired = false;
          }
        });

    this.subscriptions.push(documentTypeSub);

    const subtotalImportSub =
      this.dataFormGroup.get('subtotalImport').valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(res => {
          try {
            if (res > 0) {
              this.subtotalImportRequired = false;
              const igv = res * 0.18;
              const total = res + igv;
              this.dataFormGroup.get('igvImport').setValue(parseFloat(igv.toFixed(2)));
              this.dataFormGroup.get('totalImport').setValue(parseFloat(total.toFixed(2)));
            } else {
              this.dataFormGroup.get('subtotalImport').setValue(0);
              this.subtotalImportRequired = true;
            }
          } catch (error) {
            // console.log(error);
          }

        });

    this.subscriptions.push(subtotalImportSub);

    const igvImportSub =
      this.dataFormGroup.get('igvImport').valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(res => {
          try {
            if (res > 0) {
              this.igvImportRequired = false;
            } else {
              this.dataFormGroup.get('igvImport').setValue(null);
              this.igvImportRequired = true;
            }
          } catch (error) {
            // console.log(error);
          }
        });

    this.subscriptions.push(igvImportSub);

    const totalImportSub =
      this.dataFormGroup.get('totalImport').valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(res => {
          try {
            if (res > 0) {
              if(this.dataFormGroup.value['paymentType'] === 'CREDITO'){
                const total = this.dataFormGroup.value['totalImport'];
                this.dataFormGroup.get('indebtImport').setValue(total);
              }else{
                const total = this.dataFormGroup.value['totalImport'];
                this.dataFormGroup.get('paidImport').setValue(total);
              }
            } else {
              this.dataFormGroup.get('totalImport').setValue(0);
            }
          } catch (error) {
            // console.log(error);
          }
        });

    this.subscriptions.push(totalImportSub);

    const paymentTypeSub =
      this.dataFormGroup.get('paymentType').valueChanges
        .subscribe(res => {
          if (res === 'CREDITO') {
            this.creditDateRequired = true;
          } else {
            this.creditDateRequired = false;
          }
        });

    this.subscriptions.push(paymentTypeSub);

    const creditDateSub =
      this.dataFormGroup.get('creditDate').valueChanges
        .subscribe(res => {
          if (res) {
            this.creditDateRequired = false;
          } else {
            this.creditDateRequired = true;
          }
        });

    this.subscriptions.push(creditDateSub);


    const paidImportSub =
      this.dataFormGroup.get('paidImport').valueChanges
        .subscribe(res => {
          try {
            if (res < 0) {
              this.dataFormGroup.get('paidImport').setValue(0);
            } else if (res > this.dataFormGroup.value['totalImport']) {
              this.dataFormGroup.get('paidImport').setValue(this.dataFormGroup.value['totalImport']);
            } else {
              const debt = this.dataFormGroup.value['totalImport'] - res;
              this.dataFormGroup.get('indebtImport').setValue(parseFloat(debt.toFixed(2)));
            }
          } catch (error) {
            // console.log(error);
          }
        });

    this.subscriptions.push(paidImportSub);

    const detractionAppliesSub =
      this.detractionApplies.valueChanges
        .subscribe(res => {
          try {
            if (res) {
              this.detractionPercentageRequired = true;
              this.detractionImportRequired = true;
              this.detractionDateRequired = true;
            } else {
              this.detractionPercentageRequired = false;
              this.detractionImportRequired = false;
              this.detractionDateRequired = false;
            }
          } catch (error) {
            // console.log(error);
          }
        });

    this.subscriptions.push(detractionAppliesSub);

    const detractionPercentageSub =
      this.dataFormGroup.get('detractionPercentage').valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(300)
        )
        .subscribe(res => {
          try {
            if (res < 0) {
              this.dataFormGroup.get('detractionPercentage').setValue(0);
              this.detractionPercentageRequired = true;
            } else if (res >= 0) {

              if (res > 100) {
                this.dataFormGroup.get('detractionPercentage').setValue(100);
                res = 100;
              }

              let detraction = 0;
              const total = this.dataFormGroup.value['totalImport'] ? this.dataFormGroup.value['totalImport'] : 0;
              detraction = (total * res) / 100;

              if (detraction > total) {
                detraction = total;
              } else if (detraction < 0) {
                detraction = 0;
              }

              this.dataFormGroup.get('detractionImport').setValue(parseFloat(detraction.toFixed(2)));

              this.detractionPercentageRequired = false;
            }
          } catch (error) {
            // console.log(error);
          }
        });

    this.subscriptions.push(detractionPercentageSub);

    const detractionImportSub =
      this.dataFormGroup.get('detractionImport').valueChanges
        .pipe(
          distinctUntilChanged(),
          debounceTime(300)
        )
        .subscribe(res => {
          try {
            if (res < 0) {
              this.dataFormGroup.get('detractionImport').setValue(0);
              this.detractionImportRequired = true;
            } else if (res >= 0) {
              const total = this.dataFormGroup.value['totalImport'] ? this.dataFormGroup.value['totalImport'] : 1;

              if (res > total) {
                this.dataFormGroup.get('detractionImport').setValue(total);
                res = total;
                this.detractionImportRequired = false;
              }

              let percentage = 0;

              percentage = (100 * res) / total;

              if (percentage > 100) {
                percentage = 100;
              } else if (percentage < 0) {
                percentage = 0;
              }

              this.dataFormGroup.get('detractionPercentage').setValue(parseFloat(percentage.toFixed(2)));
              this.detractionImportRequired = false;
            }
          } catch (error) {
            // console.log(error);
          }
        });

    this.subscriptions.push(detractionImportSub);

    const detractionDateSub =
      this.dataFormGroup.get('detractionDate').valueChanges
        .subscribe(res => {
          if (res) {
            this.detractionDateRequired = false;
          } else {
            this.detractionDateRequired = true;
          }
        });

    this.subscriptions.push(detractionDateSub);

    const serial$ =
      this.dataFormGroup.get('documentSerial').valueChanges
        .pipe(
          distinctUntilChanged()
        )
        .subscribe(res => {
          if (res) {
            try {
              const upper = res.toUpperCase();
              this.dataFormGroup.get('documentSerial').setValue(upper);
            } catch (error) {
              console.log(error);
            }
          }
        });

    this.subscriptions.push(serial$);

    const correlative$ =
      this.dataFormGroup.get('documentCorrelative').valueChanges
        .pipe(
          distinctUntilChanged(),
          tap(() => {
            this.duplicates.correlativeLoading = true;
          }),
          debounceTime(500),
          map(res => res.toUpperCase()),
          tap(res => {
            this.duplicates.correlative = false;
            const find = this.dbs.purchases.filter(option =>
              option.documentCorrelative === res &&
              option.provider.ruc === this.dataFormGroup.value['provider']['ruc'] &&
              option.documentSerial === this.dataFormGroup.value['documentSerial'] &&
              option.documentType === this.dataFormGroup.value['documentType']);

            if (find.length > 0) {
              this.duplicates.correlativeLoading = false;
              this.duplicates.correlative = true;
              this.snackbar.open('Documento duplicado', 'Cerrar', {
                duration: 4000
              });
            } else {
              this.duplicates.correlativeLoading = false;
            }
          })
        ).subscribe(res => {
          if (res) {
            this.dataFormGroup.get('documentCorrelative').setValue(res);
          }
        })

    this.subscriptions.push(correlative$);

    const transactionObs =
      this.dataTransactionObservable.subscribe(res => {
        if (res) {
          this.transactionCounter++;
          if (this.transactionCounter === this.itemsList.length) {
            this.transactionDone = true;
            this.snackbar.open('Materia prima actualizada!', 'Cerrar', {
              duration: 6000
            });
          }
        } else {
          this.transactionDone = false;
        }
      });

    this.subscriptions.push(transactionObs);

  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      documentDate: [null, [Validators.required]],
      provider: [null, [Validators.required, isObjectValidator]],
      documentType: [null, [Validators.required]],
      documentSerial: [null, [Validators.required]],
      documentCorrelative: [null, [Validators.required]],
      paymentType: [null, [Validators.required]],
      creditDate: null,
      subtotalImport: null,
      igvImport: null,
      totalImport: [null, [Validators.required]],
      paidImport: [0, [Validators.required]],
      indebtImport: [0, [Validators.required]],
      detractionPercentage: null,
      detractionImport: null,
      detractionDate: null
    });
  }

  createItemForm(): void {
    this.itemFormGroup = this.fb.group({
      item: [null, [Validators.required]],
      quantity: [null, [Validators.required]],
      import: [null, [Validators.required]]
    });
  }

  showProvider(provider: Provider): string | null {
    return provider ? provider.name : null;
  }

  selectedProvider(event) {
    this.provider = event.option.value;
    this.providerSelected = true;
  }

  showItem(item: RawMaterial | string): string {
    if (item === null) return '';
    return (typeof item === 'string') ? item : item.name;
  }

  selectedItem(event) {
    this.itemFormGroup.get('quantity').setValue(null);
    this.itemFormGroup.get('import').setValue(null);
  }

  addProvider(): void {
    this.dialog.open(PurchasesRegisterAddProviderDialogComponent)
      .afterClosed().subscribe(res => {
        if (res) {
          this.dataFormGroup.get('provider').setValue(res);
          this.provider = res;
          this.providerSelected = true;
        } else {
          this.dataFormGroup.get('provider').setValue(this.provider);
        }
      });
  }

  addRawMaterial(): void {
    this.dialog.open(PurchasesRegisterAddRawDialogComponent)
      .afterClosed().subscribe(res => {
        if (res) {
          this.itemFormGroup.get('item').setValue(res);
        } else {
          this.itemFormGroup.get('item').setValue('');
        }
      });
  }

  addItem() {
    if (this.itemFormGroup.valid) {
      let _item;

      if (typeof this.itemFormGroup.value['item'] === 'string') {
        _item = {
          name: this.itemFormGroup.value['item'],
          code: ''
        }
      } else if (typeof this.itemFormGroup.value['item'] === 'object') {
        _item = this.itemFormGroup.value['item'];
      }

      const data = {
        index: this.itemsList.length,
        item: _item,
        quantity: this.itemFormGroup.value['quantity'],
        import: this.itemFormGroup.value['import']
      }

      this.itemsList.push(data);
      this.dataSource.data = this.itemsList;

      this.itemFormGroup.get('item').setValue('');
      this.itemFormGroup.get('quantity').setValue('');
      this.itemFormGroup.get('import').setValue('');

    } else {
      this.snackbar.open('Debe completar los campos para agregar un Item!', 'Cerrar', {
        duration: 6000
      });
    }
  }

  editItem(item): void {
    this.dialog.open(PurchasesRegisterEditItemDialogComponent, {
      data: {
        item: item
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.itemsList[res.index] = res;
        this.dataSource.data = this.itemsList;
        this.snackbar.open(`Item ${res.name} editado!`, 'Cerrar', {
          duration: 6000
        });
      }
    })
  }

  deleteItem(item): void {
    this.itemsList.splice(item.index, 1);

    this.itemsList.forEach((element, index) => {
      element.index = index;
    });

    this.dataSource.data = this.itemsList;

    this.snackbar.open(`Item ${item.name} borrado!`, 'Cerrar', {
      duration: 6000
    });
  }

  filterListRawMaterial(): void {
    this.filteredRawMaterials =
      this.itemFormGroup.get('item').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
          map(value => value ? this.dbs.rawMaterials.filter(option => option.name.toLowerCase().includes(value) || option.code.toLowerCase().includes(value)) : this.dbs.rawMaterials)
        );
  }

  register(): void {
    if (this.dataFormGroup.valid &&
      !this.loading &&
      !!this.itemsList.length &&
      !this.subtotalImportRequired &&
      !this.igvImportRequired &&
      !this.creditDateRequired &&
      !this.detractionPercentageRequired &&
      !this.detractionImportRequired &&
      !this.detractionDateRequired) {

      this.loading = true;

      if (this.isRawMaterial.value) {
        if (this.dataFormGroup.value['paymentType'] === 'CREDITO') {
          // console.log('REGISTRANDO CON FECHA DE EXPIRACION Y ACTUALIZANDO STOCK DE MATERIA PRIMA');
          // console.log('Formulario', this.dataFormGroup.value);
          // console.log('Lista', this.itemsList);

          try {
            this.itemsList.forEach(element => {
              this.af.firestore.runTransaction(t => {
                return t.get(this.dbs.rawMaterialsCollection.doc(element.item.id).ref)
                  .then(doc => {
                    const newStock = doc.data().stock + element.quantity;
                    const kardexRef = this.af.firestore.collection(doc.ref.path + '/kardex').doc()

                    t.update(this.dbs.rawMaterialsCollection.doc(element.item.id).ref, {
                      stock: newStock,
                      purchase: (element.import / element.quantity).toFixed(2)
                    });

                    t.set(kardexRef, {
                      id: kardexRef.id,
                      documentDate: this.dataFormGroup.value['documentDate'].valueOf(),
                      documentType: this.dataFormGroup.value['documentType'],
                      documentSerial: this.dataFormGroup.value['documentSerial'],
                      documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
                      provider: this.dataFormGroup.value['provider'],
                      rawMaterial: element.item,
                      saleQuantity: null,
                      saleImport: null,
                      saleUnitPrice: null,
                      purchaseQuantity: element.quantity,
                      purchaseImport: element.import,
                      purchaseUnitPrice: (element.import / element.quantity).toFixed(2),
                      source: 'purchases',
                      regDate: Date.now(),
                      createdBy: this.auth.userInteriores.displayName,
                      createdByUid: this.auth.userInteriores.uid,
                    });

                  });

              }).then(() => {
                this.transactionObservable.next(true);
              }).catch(err => {
                console.log(err);
                this.loading = false;
                this.snackbar.open(`Hubo un error actualizando el item: ${element.item.name}`, 'Cerrar', {
                  duration: 6000
                });
              });
            });

            let purchaseData = {
              id: '',
              documentDate: this.dataFormGroup.value['documentDate'] ? this.dataFormGroup.value['documentDate'].valueOf() : null,
              documentType: this.dataFormGroup.value['documentType'],
              documentSerial: this.dataFormGroup.value['documentSerial'],
              documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
              provider: this.dataFormGroup.value['provider'],
              itemsList: this.itemsList,
              payments: [],
              creditDate: this.dataFormGroup.value['creditDate'] ? this.dataFormGroup.value['creditDate'].valueOf() : null,
              paymentDate: null,
              totalImport: this.dataFormGroup.value['totalImport'],
              subtotalImport: this.dataFormGroup.value['subtotalImport'],
              igvImport: this.dataFormGroup.value['igvImport'],
              paymentType: this.dataFormGroup.value['paymentType'],
              paidImport: this.dataFormGroup.value['paidImport'],
              indebtImport: this.dataFormGroup.value['indebtImport'],
              verifiedByAccountant: false,
              detractionApplies: this.detractionApplies.value,
              detractionPercentage: this.dataFormGroup.value['detractionPercentage'],
              detractionImport: this.dataFormGroup.value['detractionImport'],
              detractionDate: this.dataFormGroup.value['detractionDate'] ? this.dataFormGroup.value['detractionDate'].valueOf() : null,
              isRawMaterial: this.isRawMaterial.value,
              source: 'purchases',
              status: 'Pendiente',
              regDate: Date.now(),
              createdBy: this.auth.userInteriores.displayName,
              createdByUid: this.auth.userInteriores.uid,
              editedBy: null,
              editedByUid: null,
              editedDate: null,
              approvedBy: null,
              approvedByUid: null,
              approvedDate: null,
              verifiedBy: null,
              verifiedByUid: null,
              verifiedDate: null
            };

            this.dbs.purchasesCollection
              .add(purchaseData)
              .then(ref => {

                purchaseData.id = ref.id;

                ref.update({ id: ref.id })
                  .then(() => {

                    this.dbs.debtsToPayCollection
                      .doc(ref.id)
                      .set(purchaseData)

                    this.loading = false;
                    this.snackbar.open('Documento registrado !', 'Cerrar', {
                      duration: 6000
                    });

                    this.dialogRef.close(true);
                  })
                  .catch(err => {
                    console.log(err);
                    this.loading = false;
                    this.snackbar.open('Hubo un error grabando la cuenta por pagar', 'Cerrar', {
                      duration: 6000
                    });
                  })
              })
              .catch(err => {
                console.log(err);
                this.loading = false;
                this.snackbar.open('Hubo un error grabando la compra', 'Cerrar', {
                  duration: 6000
                });
              })
          } catch (error) {
            console.log(error);
            this.loading = false;
            this.snackbar.open('Hubo un error grabando la compra', 'Cerrar', {
              duration: 6000
            });
          }

        } else {
          // console.log('REGISTRANDO SIN FECHA DE EXPIRACION Y ACTUALIZANDO STOCK DE MATERIA PRIMA');
          // console.log('Formulario', this.dataFormGroup.value);
          // console.log('Lista', this.itemsList);

          try {
            this.itemsList.forEach(element => {
              this.af.firestore.runTransaction(t => {
                return t.get(this.dbs.rawMaterialsCollection.doc(element.item.id).ref)
                  .then(doc => {
                    const newStock = doc.data().stock + element.quantity;
                    const kardexRef = this.af.firestore.collection(doc.ref.path + '/kardex').doc()

                    t.update(this.dbs.rawMaterialsCollection.doc(element.item.id).ref, {
                      stock: newStock,
                      purchase: (element.import / element.quantity).toFixed(2)
                    });

                    t.set(kardexRef, {
                      id: kardexRef.id,
                      documentDate: this.dataFormGroup.value['documentDate'].valueOf(),
                      documentType: this.dataFormGroup.value['documentType'],
                      documentSerial: this.dataFormGroup.value['documentSerial'],
                      documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
                      provider: this.dataFormGroup.value['provider'],
                      rawMaterial: element.item,
                      saleQuantity: null,
                      saleImport: null,
                      saleUnitPrice: null,
                      purchaseQuantity: element.quantity,
                      purchaseImport: element.import,
                      purchaseUnitPrice: (element.import / element.quantity).toFixed(2),
                      source: 'purchases',
                      regDate: Date.now(),
                      createdBy: this.auth.userInteriores.displayName,
                      createdByUid: this.auth.userInteriores.uid,
                    });

                  });

              }).then(() => {
                this.transactionObservable.next(true);
              }).catch(err => {
                console.log(err);
                this.loading = false;
                this.snackbar.open(`Hubo un error actualizando el item: ${element.item.name}`, 'Cerrar', {
                  duration: 6000
                });
              });
            });

            let purchaseData = {
              id: '',
              documentDate: this.dataFormGroup.value['documentDate'] ? this.dataFormGroup.value['documentDate'].valueOf() : null,
              documentType: this.dataFormGroup.value['documentType'],
              documentSerial: this.dataFormGroup.value['documentSerial'],
              documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
              provider: this.dataFormGroup.value['provider'],
              itemsList: this.itemsList,
              payments: [{
                type: 'TOTAL',
                paymentType: this.dataFormGroup.value['paymentType'],
                import: this.dataFormGroup.value['totalImport'],
                cashReference: null,
                paidBy: null,
                paidByUid: null,
                regDate: Date.now()
              }],
              creditDate: this.dataFormGroup.value['creditDate'] ? this.dataFormGroup.value['creditDate'].valueOf() : null,
              paymentDate: null,
              totalImport: this.dataFormGroup.value['totalImport'],
              subtotalImport: this.dataFormGroup.value['subtotalImport'],
              igvImport: this.dataFormGroup.value['igvImport'],
              paymentType: this.dataFormGroup.value['paymentType'],
              paidImport: this.dataFormGroup.value['paidImport'],
              indebtImport: this.dataFormGroup.value['indebtImport'],
              verifiedByAccountant: false,
              detractionApplies: this.detractionApplies.value,
              detractionPercentage: this.dataFormGroup.value['detractionPercentage'],
              detractionImport: this.dataFormGroup.value['detractionImport'],
              detractionDate: this.dataFormGroup.value['detractionDate'] ? this.dataFormGroup.value['detractionDate'].valueOf() : null,
              isRawMaterial: this.isRawMaterial.value,
              source: 'purchases',
              status: 'Pagado',
              regDate: Date.now(),
              createdBy: this.auth.userInteriores.displayName,
              createdByUid: this.auth.userInteriores.uid,
              editedBy: null,
              editedByUid: null,
              editedDate: null,
              approvedBy: null,
              approvedByUid: null,
              approvedDate: null,
              verifiedBy: null,
              verifiedByUid: null,
              verifiedDate: null
            };

            this.dbs.purchasesCollection
              .add(purchaseData)
              .then(ref => {

                purchaseData.id = ref.id;

                ref.update({ id: ref.id })
                  .then(() => {

                    this.loading = false;
                    this.snackbar.open('Documento registrado !', 'Cerrar', {
                      duration: 6000
                    });
                    this.dialogRef.close(true);
                  })
                  .catch(err => {
                    console.log(err);
                    this.loading = false;
                    this.snackbar.open('Hubo un error grabando la cuenta por pagar', 'Cerrar', {
                      duration: 6000
                    });
                  })
              })
              .catch(err => {
                console.log(err);
                this.loading = false;
                this.snackbar.open('Hubo un error grabando la compra', 'Cerrar', {
                  duration: 6000
                });
              })
          } catch (error) {
            console.log(error);
            this.loading = false;
            this.snackbar.open('Hubo un error grabando la compra', 'Cerrar', {
              duration: 6000
            });
          }
        }
      } else {
        if (this.dataFormGroup.value['paymentType'] === 'CREDITO') {
          // console.log('REGISTRNDO CON FECHA DE EXPIRACION');
          // console.log('Formulario', this.dataFormGroup.value);
          // console.log('Lista', this.itemsList);
          try {

            let purchaseData = {
              id: '',
              documentDate: this.dataFormGroup.value['documentDate'] ? this.dataFormGroup.value['documentDate'].valueOf() : null,
              documentType: this.dataFormGroup.value['documentType'],
              documentSerial: this.dataFormGroup.value['documentSerial'],
              documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
              provider: this.dataFormGroup.value['provider'],
              itemsList: this.itemsList,
              payments: [],
              creditDate: this.dataFormGroup.value['creditDate'] ? this.dataFormGroup.value['creditDate'].valueOf() : null,
              paymentDate: null,
              totalImport: this.dataFormGroup.value['totalImport'],
              subtotalImport: this.dataFormGroup.value['subtotalImport'],
              igvImport: this.dataFormGroup.value['igvImport'],
              paymentType: this.dataFormGroup.value['paymentType'],
              paidImport: this.dataFormGroup.value['paidImport'],
              indebtImport: this.dataFormGroup.value['indebtImport'],
              verifiedByAccountant: false,
              detractionApplies: this.detractionApplies.value,
              detractionPercentage: this.dataFormGroup.value['detractionPercentage'],
              detractionImport: this.dataFormGroup.value['detractionImport'],
              detractionDate: this.dataFormGroup.value['detractionDate'] ? this.dataFormGroup.value['detractionDate'].valueOf() : null,
              isRawMaterial: this.isRawMaterial.value,
              source: 'purchases',
              status: 'Pendiente',
              regDate: Date.now(),
              createdBy: this.auth.userInteriores.displayName,
              createdByUid: this.auth.userInteriores.uid,
              editedBy: null,
              editedByUid: null,
              editedDate: null,
              approvedBy: null,
              approvedByUid: null,
              approvedDate: null,
              verifiedBy: null,
              verifiedByUid: null,
              verifiedDate: null
            };

            this.dbs.purchasesCollection
              .add(purchaseData)
              .then(ref => {

                purchaseData.id = ref.id;

                ref.update({ id: ref.id })
                  .then(() => {

                    this.dbs.debtsToPayCollection
                      .doc(ref.id)
                      .set(purchaseData)

                    this.loading = false;
                    this.snackbar.open('Documento registrado !', 'Cerrar', {
                      duration: 6000
                    });
                    this.dialogRef.close(true);
                  })
                  .catch(err => {
                    console.log(err);
                    this.loading = false;
                    this.snackbar.open('Hubo un error grabando la cuenta por pagar', 'Cerrar', {
                      duration: 6000
                    });
                  })
              })
              .catch(err => {
                console.log(err);
                this.loading = false;
                this.snackbar.open('Hubo un error grabando la compra', 'Cerrar', {
                  duration: 6000
                });
              })
          } catch (error) {
            console.log(error);
            this.loading = false;
            this.snackbar.open('Hubo un error grabando la compra', 'Cerrar', {
              duration: 6000
            });
          }
        } else {
          // console.log('REGISTRNDO SIN FECHA DE EXPIRACION');
          // console.log('Formulario', this.dataFormGroup.value);
          // console.log('Lista', this.itemsList);

          try {

            let purchaseData = {
              id: '',
              documentDate: this.dataFormGroup.value['documentDate'] ? this.dataFormGroup.value['documentDate'].valueOf() : null,
              documentType: this.dataFormGroup.value['documentType'],
              documentSerial: this.dataFormGroup.value['documentSerial'],
              documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
              provider: this.dataFormGroup.value['provider'],
              itemsList: this.itemsList,
              payments: [{
                type: 'TOTAL',
                paymentType: this.dataFormGroup.value['paymentType'],
                import: this.dataFormGroup.value['totalImport'],
                cashReference: null,
                paidBy: null,
                paidByUid: null,
                regDate: Date.now()
              }],
              creditDate: this.dataFormGroup.value['creditDate'] ? this.dataFormGroup.value['creditDate'].valueOf() : null,
              paymentDate: null,
              totalImport: this.dataFormGroup.value['totalImport'],
              subtotalImport: this.dataFormGroup.value['subtotalImport'],
              igvImport: this.dataFormGroup.value['igvImport'],
              paymentType: this.dataFormGroup.value['paymentType'],
              paidImport: this.dataFormGroup.value['paidImport'],
              indebtImport: this.dataFormGroup.value['indebtImport'],
              verifiedByAccountant: false,
              detractionApplies: this.detractionApplies.value,
              detractionPercentage: this.dataFormGroup.value['detractionPercentage'],
              detractionImport: this.dataFormGroup.value['detractionImport'],
              detractionDate: this.dataFormGroup.value['detractionDate'] ? this.dataFormGroup.value['detractionDate'].valueOf() : null,
              isRawMaterial: this.isRawMaterial.value,
              source: 'purchases',
              status: 'Pagado',
              regDate: Date.now(),
              createdBy: this.auth.userInteriores.displayName,
              createdByUid: this.auth.userInteriores.uid,
              editedBy: null,
              editedByUid: null,
              editedDate: null,
              approvedBy: null,
              approvedByUid: null,
              approvedDate: null,
              verifiedBy: null,
              verifiedByUid: null,
              verifiedDate: null
            };

            this.dbs.purchasesCollection
              .add(purchaseData)
              .then(ref => {

                purchaseData.id = ref.id;

                ref.update({ id: ref.id })
                  .then(() => {
                    this.loading = false;
                    this.snackbar.open('Documento registrado !', 'Cerrar', {
                      duration: 6000
                    });
                    this.dialogRef.close(true);
                  })
                  .catch(err => {
                    console.log(err);
                    this.loading = false;
                    this.snackbar.open('Hubo un error grabando la cuenta por pagar', 'Cerrar', {
                      duration: 6000
                    });
                  })
              })
              .catch(err => {
                console.log(err);
                this.loading = false;
                this.snackbar.open('Hubo un error grabando la compra', 'Cerrar', {
                  duration: 6000
                });
              })
          } catch (error) {
            console.log(error);
            this.loading = false;
            this.snackbar.open('Hubo un error grabando la compra', 'Cerrar', {
              duration: 6000
            });
          }
        }
      }
    } else {
      this.loading = false;
      this.snackbar.open('Formulario o condición incompleta', 'Cerrar', {
        duration: 6000
      });
    }
  }

}
