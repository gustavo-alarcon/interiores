import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatabaseService } from 'src/app/core/database.service';
import { Product, SerialNumber, Store } from 'src/app/core/types';
import { StoresChangeStatusConfirmComponent } from '../stores-change-status-confirm/stores-change-status-confirm.component';
import { StoresSellDialogComponent } from '../stores-sell-dialog/stores-sell-dialog.component';
import { StoresSeparateDialogComponent } from '../stores-separate-dialog/stores-separate-dialog.component';

@Component({
  selector: 'app-stores-show-serials',
  templateUrl: './stores-show-serials.component.html',
  styles: []
})
export class StoresShowSerialsComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['serie', 'status', 'color', 'actions'];
  dataSource = new MatTableDataSource();

  subscriptions: Array<Subscription> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public af: AngularFirestore,
    public dbs: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data: {product: Product, store: Store},
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<StoresShowSerialsComponent>
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    const serie$ =
      this.dbs.storesCollection
        .doc(this.data.store.id)
        .collection('products')
        .doc(this.data.product.id)
        .collection<SerialNumber>('products', ref => ref.orderBy('serie','desc'))
        .valueChanges()
        .subscribe(res => {
          if (res) {
            this.dataSource.data = res;
          }
        });

    this.subscriptions.push(serie$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  changeStatus(serial: SerialNumber): void {
    this.dialog.open(StoresChangeStatusConfirmComponent, {
      data: {
        serial: serial,
        store: this.data.store
      }
    });
  }

  sellSerial(serial: SerialNumber): void {
    this.dialog.open(StoresSellDialogComponent, {
      data: {
        product: this.data.product,
        store: this.data.store,
        serial: serial
      }
    });
  }

  separateProduct(serial: SerialNumber): void {
    this.dialog.open(StoresSeparateDialogComponent, {
      data: {
        serial: serial,
        product: this.data.product
      }
    });
  }

}
