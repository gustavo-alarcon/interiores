import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { Purchase } from 'src/app/core/types';

@Component({
  selector: 'app-purchases-register-show-payments-dialog',
  templateUrl: './purchases-register-show-payments-dialog.component.html',
  styles: []
})
export class PurchasesRegisterShowPaymentsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'regDate', 'type', 'paymentType', 'import', 'paidBy', 'cashReference'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { purchase: Purchase }
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.purchase.payments;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
