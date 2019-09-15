import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { Purchase } from 'src/app/core/types';

@Component({
  selector: 'app-debts-to-pay-show-payments-dialog',
  templateUrl: './debts-to-pay-show-payments-dialog.component.html',
  styles: []
})
export class DebtsToPayShowPaymentsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'regDate', 'type', 'paymentType', 'import', 'paidBy', 'cashReference'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { debt: Purchase }
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.debt.payments;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
