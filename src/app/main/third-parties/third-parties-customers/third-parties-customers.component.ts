import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { Customer } from 'src/app/core/types';
import { ThirdPartiesCustomersCreateDialogComponent } from './third-parties-customers-create-dialog/third-parties-customers-create-dialog.component';
import { ThirdPartiesCustomersEditDialogComponent } from './third-parties-customers-edit-dialog/third-parties-customers-edit-dialog.component';
import { ThirdPartiesCustomersDeleteConfirmComponent } from './third-parties-customers-delete-confirm/third-parties-customers-delete-confirm.component';

@Component({
  selector: 'app-third-parties-customers',
  templateUrl: './third-parties-customers.component.html',
  styles: []
})
export class ThirdPartiesCustomersComponent implements OnInit {

  disableTooltips = new FormControl(false);

  filteredCustomers: Array<Customer> = [];

  displayedColumns: string[] = ['index', 'name', 'dni', 'address', 'phone', 'mail', 'createdBy','editedBy', 'actions'];


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
      this.dbs.currentDataCustomers.subscribe(res => {
        if (res) {
          this.filteredCustomers = res;
          this.dataSource.data = res;
        }
      });

    this.subscriptions.push(customer$);
  }

  filterData(ref: string): void {
    this.dataSource.filter = ref.trim().toLowerCase();
  }

  createCustomer(): void {
    this.dialog.open(ThirdPartiesCustomersCreateDialogComponent);
  }

  editCustomer(customer: Customer): void {
    this.dialog.open(ThirdPartiesCustomersEditDialogComponent, {
      data: {
        customer: customer
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    this.dialog.open(ThirdPartiesCustomersDeleteConfirmComponent, {
      data: {
        customer: customer
      }
    });
  }

}
