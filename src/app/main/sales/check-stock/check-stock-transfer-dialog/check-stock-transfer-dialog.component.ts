import { Component, OnInit, Inject } from '@angular/core';
import { SerialNumber, Product, Store, TransferList, Transfer } from 'src/app/core/types';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { map, startWith } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/core/auth.service';
import { isObjectValidator } from 'src/app/core/is-object-validator';

@Component({
  selector: 'app-check-stock-transfer-dialog',
  templateUrl: './check-stock-transfer-dialog.component.html',
  styles: []
})
export class CheckStockTransferDialogComponent implements OnInit {

  loading: boolean = false;

  dataFormGroup: FormGroup;

  filteredDestinationStores: Observable<Store[]>;

  transferLists: Array<TransferList> = [];
  tableList: Array<SerialNumber> = [];

  selectedSerials: Array<boolean[]> = [];
  currentSerialIndex: number = -1;
  selectedProducts: Array<Product> = [];

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private fb: FormBuilder,
    private af: AngularFirestore,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<CheckStockTransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serial: SerialNumber, product: Product }
  ) { }

  ngOnInit() {
    this.createForm();

    this.filteredDestinationStores =
      this.dataFormGroup.get('destination').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
          map(name => name ? this.dbs.stores.filter(option => option.name.toLowerCase()) : this.dbs.stores)
        )
  }

  createForm(): void {
    const originStore = this.dbs.stores.filter(option => option.name === this.data.serial.location);

    this.dataFormGroup = this.fb.group({
      origin: [originStore[0] ? originStore[0] : null, [Validators.required]],
      destination: [null, [Validators.required, isObjectValidator]]
    });
  }

  showStore(store: Store): string | null {
    return store ? store.name : null;
  }

  transfer(): void {
    if (this.dataFormGroup.valid) {
      this.loading = true;

      let transaction =
        this.af.firestore.runTransaction(t => {
          return t.get(this.dbs.transferCorrelativeDocument.ref)
            .then(doc => {

              const newCorrelative = doc.data().correlative + 1;
              const transferRef = this.dbs.transfersCollection.doc<Transfer>(`TR${newCorrelative}`);
              
              if (this.dataFormGroup.value['origin']['name'] === "Productos acabados") {
                this.dbs.finishedProductsCollection
                  .doc(this.data.serial.productId)
                  .collection('products')
                  .doc(this.data.serial.id)
                  .update({ status: 'Traslado' })
                  .catch(err => {
                    console.log(err);
                  });
              } else {
                this.dbs.storesCollection
                  .doc(this.dataFormGroup.value['origin']['id'])
                  .collection('products')
                  .doc(this.data.serial.productId)
                  .collection('products')
                  .doc(this.data.serial.id)
                  .update({ status: 'Traslado' })
                  .catch(err => {
                    console.log(err);
                  });
              }

              t.update(this.dbs.transferCorrelativeDocument.ref,
                { correlative: newCorrelative });

              // setting new transfer operation
              t.set(transferRef.ref, {
                id: `TR${newCorrelative}`,
                correlative: newCorrelative,
                origin: this.dataFormGroup.value['origin'],
                destination: this.dataFormGroup.value['destination'],
                serialList: [this.data.serial],
                transferList: [{product: this.data.product, serialList: [this.data.serial]}],
                status: 'Solicitado',
                source: 'sales',
                regDate: Date.now(),
                createdBy: this.auth.userInteriores.displayName,
                createdByUid: this.auth.userInteriores.uid,
                approvedBy: null,
                approvedByUid: null,
                approvedDate: null,
                canceledBy: null,
                canceldByUid: null,
                canceledDate: null,
                carriedBy: null,
                carriedByUid: null,
                carriedDate: null,
              });

            });
        }).then(() => {
          this.loading = false;
          this.snackbar.open('Traslado solicitado!', 'Cerrar', {
            duration: 6000
          });
          this.dialogRef.close(true)
        }).catch(err => {
          console.log('Transaction failure:', err);
        });
    }

  }



}
