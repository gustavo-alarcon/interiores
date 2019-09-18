import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { WholesaleCustomer } from 'src/app/core/types';

@Component({
  selector: 'app-third-parties-wholesale-contacts-dialog',
  templateUrl: './third-parties-wholesale-contacts-dialog.component.html',
  styles: []
})
export class ThirdPartiesWholesaleContactsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'name', 'phone', 'mail'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {wholesale: WholesaleCustomer}
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.wholesale.contacts;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
