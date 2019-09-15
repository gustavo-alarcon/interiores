import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

@Component({
  selector: 'app-purchases-register-show-items-dialog',
  templateUrl: './purchases-register-show-items-dialog.component.html',
  styles: []
})
export class PurchasesRegisterShowItemsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'item', 'quantity', 'import'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {itemsList: any}
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.itemsList;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
