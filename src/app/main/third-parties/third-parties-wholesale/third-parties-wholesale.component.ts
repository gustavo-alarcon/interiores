import { Component, OnInit, ViewChild } from '@angular/core';
import { WholesaleCustomer } from 'src/app/core/types';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { ThirdPartiesWholesaleCreateDialogComponent } from './third-parties-wholesale-create-dialog/third-parties-wholesale-create-dialog.component';
import { ThirdPartiesWholesaleContactsDialogComponent } from './third-parties-wholesale-contacts-dialog/third-parties-wholesale-contacts-dialog.component';
import { ThirdPartiesWholesaleEditDialogComponent } from './third-parties-wholesale-edit-dialog/third-parties-wholesale-edit-dialog.component';
import { ThirdPartiesWholesaleDeleteConfirmComponent } from './third-parties-wholesale-delete-confirm/third-parties-wholesale-delete-confirm.component';

@Component({
  selector: 'app-third-parties-wholesale',
  templateUrl: './third-parties-wholesale.component.html',
  styles: []
})
export class ThirdPartiesWholesaleComponent implements OnInit {

  disableTooltips = new FormControl(false);

  filteredCustomers: Array<WholesaleCustomer> = [];

  displayedColumns: string[] = ['index', 'name', 'dni', 'phone', 'mail', 'contact', 'createdBy','editedBy', 'actions'];


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

    const customer$ =
      this.dbs.currentDataWholesale.subscribe(res => {
        if (res) {
          this.filteredCustomers = res;
          this.dataSource.data = res;
        }
      });

    this.subscriptions.push(customer$);
  }

  filterData(ref: string): void {
    ref = ref.toLowerCase();
    this.filteredCustomers = this.dbs.wholesale.filter(option =>
      option.type.toLowerCase().includes(ref) ||
      (option.displayName ? option.displayName.toLowerCase().includes(ref) : false) ||
      (option.dni ? option.dni.toString().includes(ref) : false) ||
      (option.ruc ? option.ruc.toString().includes(ref) : false));
    this.dataSource.data = this.filteredCustomers;
  }

  createWholesaleCustomer(): void {
    this.dialog.open(ThirdPartiesWholesaleCreateDialogComponent);
  }

  openContactList(wholesale: WholesaleCustomer): void {
    this.dialog.open(ThirdPartiesWholesaleContactsDialogComponent, {
      data: {
        wholesale: wholesale
      }
    });
  }

  editWholesaleCustomer(wholesale: WholesaleCustomer): void {
    this.dialog.open(ThirdPartiesWholesaleEditDialogComponent, {
      data: {
        wholesale: wholesale
      }
    });
  }

  deleteWholesaleCustomer(wholesale: WholesaleCustomer): void {
    this.dialog.open(ThirdPartiesWholesaleDeleteConfirmComponent, {
      data: {
        wholesale: wholesale
      }
    });
  }

}
