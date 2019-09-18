import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { RawMaterial, Provider, Purchase } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { startWith, map, distinctUntilChanged, debounceTime, tap } from 'rxjs/operators';
import { isObjectValidator } from 'src/app/core/is-object-validator';
import { PurchasesRegisterAddProviderDialogComponent } from '../purchases-register-add-provider-dialog/purchases-register-add-provider-dialog.component';
import { PurchasesRegisterAddRawDialogComponent } from '../purchases-register-add-raw-dialog/purchases-register-add-raw-dialog.component';

@Component({
  selector: 'app-purchases-register-edit-dialog',
  templateUrl: './purchases-register-edit-dialog.component.html',
  styles: []
})
export class PurchasesRegisterEditDialogComponent implements OnInit {

  loading = false;

  detractionApplies = new FormControl(false);

  dataFormGroup: FormGroup;
  itemFormGroup: FormGroup;

  filteredProviders: Observable<Provider[]>;

  documentTypes = [
    'FACTURA',
    'BOLETA',
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

  subscriptions: Array<Subscription> = [];

  constructor(
    private fb: FormBuilder,
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog,
    private af: AngularFirestore,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<PurchasesRegisterEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { purchase: Purchase }
  ) { }

  ngOnInit() {

    this.createForm();

    this.filteredProviders =
      this.dataFormGroup.get('provider').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.ruc.toString()),
          map(value => value ? this.dbs.providers.filter(option => option.ruc.toString().includes(value) || option.name.toLowerCase().includes(value)) : this.dbs.providers)
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
        .subscribe(res => {
          try {
            if (res > 0) {
              this.subtotalImportRequired = false;
            } else {
              this.dataFormGroup.get('subtotalImport').setValue(null);
              this.subtotalImportRequired = true;
            }
          } catch (error) {
            // console.log(error);
          }

        });

    this.subscriptions.push(subtotalImportSub);

    const igvImportSub =
      this.dataFormGroup.get('igvImport').valueChanges
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
            if (res <= 0) {
              this.dataFormGroup.get('paidImport').setValue(null);
            } else if (res > this.dataFormGroup.value['totalImport']) {
              this.dataFormGroup.get('paidImport').setValue(this.dataFormGroup.value['totalImport']);
            } else {
              const debt = this.dataFormGroup.value['totalImport'] - res;
              this.dataFormGroup.get('indebtImport').setValue(debt);
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
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      documentDate: [new Date(this.data.purchase.documentDate), [Validators.required]],
      provider: [this.data.purchase.provider, [Validators.required, isObjectValidator]],
      documentType: [this.data.purchase.documentType, [Validators.required]],
      documentSerial: [this.data.purchase.documentSerial, [Validators.required]],
      documentCorrelative: [this.data.purchase.documentCorrelative, [Validators.required]],
      paymentType: [this.data.purchase.paymentType, [Validators.required]],
      creditDate: new Date(this.data.purchase.creditDate),
      subtotalImport: this.data.purchase.subtotalImport,
      igvImport: this.data.purchase.igvImport,
      totalImport: [this.data.purchase.totalImport, [Validators.required]],
      paidImport: [this.data.purchase.paidImport, [Validators.required]],
      indebtImport: [this.data.purchase.indebtImport, [Validators.required]],
      detractionPercentage: this.data.purchase.detractionPercentage,
      detractionImport: this.data.purchase.detractionImport,
      detractionDate: new Date(this.data.purchase.detractionDate)
    });

    this.detractionApplies.setValue(this.data.purchase.detractionApplies);
  }

  showProvider(provider: Provider): string | null {
    return provider ? provider.name : null;
  }

  selectedProvider(event) {
    this.provider = event.option.value;
    this.providerSelected = true;
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

  edit(): void {
    if (this.dataFormGroup.valid &&
      !this.loading &&
      !this.subtotalImportRequired &&
      !this.igvImportRequired &&
      !this.creditDateRequired &&
      !this.detractionPercentageRequired &&
      !this.detractionImportRequired &&
      !this.detractionDateRequired) {

      this.loading = true;

      const updateData = {
        documentDate: this.dataFormGroup.value['documentDate'] ? this.dataFormGroup.value['documentDate'].valueOf() : null,
        provider: this.dataFormGroup.value['provider'],
        documentType: this.dataFormGroup.value['documentType'],
        documentSerial: this.dataFormGroup.value['documentSerial'],
        documentCorrelative: this.dataFormGroup.value['documentCorrelative'],
        paymentType: this.dataFormGroup.value['paymentType'],
        creditDate: this.dataFormGroup.value['creditDate'] ? this.dataFormGroup.value['creditDate'].valueOf() : null,
        subtotalImport: this.dataFormGroup.value['subtotalImport'],
        igvImport: this.dataFormGroup.value['igvImport'],
        totalImport: this.dataFormGroup.value['totalImport'],
        paidImport: this.dataFormGroup.value['paidImport'],
        indebtImport: this.dataFormGroup.value['indebtImport'],
        detractionApplies: this.detractionApplies.value,
        detractionPercentage: this.dataFormGroup.value['detractionPercentage'],
        detractionImport: this.dataFormGroup.value['detractionImport'],
        detractionDate: this.dataFormGroup.value['detractionDate'] ? this.dataFormGroup.value['detractionDate'].valueOf() : null,
        editedBy: this.auth.userInteriores.displayName,
        editedByUid: this.auth.userInteriores.uid,
        editedDate: Date.now()
      }

      this.dbs.purchasesCollection
        .doc(this.data.purchase.id)
        .update(updateData)
        .then(() => {
          this.loading = false;
          this.snackbar.open('Documento editado!', 'Cerrar', {
            duration: 6000
          });
          this.dialogRef.close(true);
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.snackbar.open('Hubo un error editando el documento', 'Cerrar', {
            duration: 6000
          });
        });

    } else {
      this.loading = false;
    }
  }

}
