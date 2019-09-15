import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Provider } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-third-parties-providers-banks-dialog',
  templateUrl: './third-parties-providers-banks-dialog.component.html',
  styles: []
})
export class ThirdPartiesProvidersBanksDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'bank', 'type', 'accountNumber'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {provider: Provider}
  ) { }

  ngOnInit() {
    this.dataSource.data = this.data.provider.bankAccounts;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
