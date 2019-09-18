import { AngularFirestore } from '@angular/fire/firestore';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, Inject, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Product, SerialNumber } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { FinishedProductsChangeStatusConfirmComponent } from '../finished-products-change-status-confirm/finished-products-change-status-confirm.component';
import { FinishedProductsChangeColorConfirmComponent } from '../finished-products-change-color-confirm/finished-products-change-color-confirm.component';

@Component({
  selector: 'app-finished-products-show-serie-dialog',
  templateUrl: './finished-products-show-serie-dialog.component.html',
  styles: []
})
export class FinishedProductsShowSerieDialogComponent implements OnInit, OnDestroy {

  loading: boolean = false;

  displayedColumns: string[] = ['serie', 'status', 'color', 'actions'];
  dataSource = new MatTableDataSource();

  subscriptions: Array<Subscription> = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    public af: AngularFirestore,
    public dbs: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data: Product,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<FinishedProductsShowSerieDialogComponent>
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.loading = true;

    const serie$ =
      this.dbs.finishedProductsCollection
        .doc(this.data.id)
        .collection<SerialNumber>('products', ref => ref.orderBy('serie','desc'))
        .valueChanges()
        .subscribe(res => {
          if (res) {
            this.loading = false;
            this.dataSource.data = res;
          }
        });

    this.subscriptions.push(serie$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  changeStatus(product: SerialNumber): void {
    this.dialog.open(FinishedProductsChangeStatusConfirmComponent, {
      data: product
    })
  }

  changeColor(product: SerialNumber): void {
    this.dialog.open(FinishedProductsChangeColorConfirmComponent, {
      data: product
    })
  }

}
