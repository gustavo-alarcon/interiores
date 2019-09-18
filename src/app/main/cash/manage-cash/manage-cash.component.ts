import { Component, OnInit, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { FormControl } from '@angular/forms';
import { Cash } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { ManageCashCreateDialogComponent } from './manage-cash-create-dialog/manage-cash-create-dialog.component';
import { ManageCashEditDialogComponent } from './manage-cash-edit-dialog/manage-cash-edit-dialog.component';
import { ManageCashDeleteConfirmComponent } from './manage-cash-delete-confirm/manage-cash-delete-confirm.component';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-manage-cash',
  templateUrl: './manage-cash.component.html',
  styles: []
})
export class ManageCashComponent implements OnInit {

  disableTooltips = new FormControl(false);

  filteredCashList: Array<Cash> = [];

  displayedColumns: string[] = ['index', 'open', 'currentOwner', 'name', 'location', 'supervisor', 'password', 'lastOpening', 'lastClosure', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    let cash$ =
      this.dbs.currentDataCashList
        .subscribe(res => {
          if (res) {
            this.filteredCashList = res;
            this.dataSource.data = this.filteredCashList;
          }
        })

  }

  filterData(value: string): void {
    let ref = value.toLowerCase();

    this.filteredCashList = this.dbs.cashList.filter(option => 
      (option.open ? 'Abierta':'Cerrada').toLowerCase().includes(ref) ||
      option.currentOwner.displayName.toLowerCase().includes(ref) ||
      option.name.toLowerCase().includes(ref) ||
      option.location.name.toLowerCase().includes(ref) ||
      option.supervisor.displayName.toLowerCase().includes(ref));

    this.dataSource.data = this.filteredCashList;
  }

  createCash(): void {
    this.dialog.open(ManageCashCreateDialogComponent);
  }

  editCash(cash: Cash): void {
    this.dialog.open(ManageCashEditDialogComponent, {
      data: {
        cash: cash
      }
    });
  }

  deleteCash(cash: Cash): void {
    this.dialog.open(ManageCashDeleteConfirmComponent, {
      data: {
        cash: cash
      }
    })
  }

  goToCashReports(cash: Cash): void {
    // go to component
  }

  setCash(cash: Cash): void {
    // settings
  }

}
