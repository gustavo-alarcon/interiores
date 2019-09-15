import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { Purchase } from 'src/app/core/types';

@Component({
  selector: 'app-debts-to-pay-show-items-dialog',
  templateUrl: './debts-to-pay-show-items-dialog.component.html',
  styles: []
})
export class DebtsToPayShowItemsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'item', 'quantity', 'import'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {debt: Purchase}
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.debt.itemsList;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
