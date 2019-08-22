import { OrdersListRestoreConfirmComponent } from './orders-list-restore-confirm/orders-list-restore-confirm.component';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Requirement, Order } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { OrdersListEditDialogComponent } from './orders-list-edit-dialog/orders-list-edit-dialog.component';
import { OrdersListCancelConfirmComponent } from './orders-list-cancel-confirm/orders-list-cancel-confirm.component';

@Component({
  selector: 'app-orders-list',
  templateUrl: './orders-list.component.html',
  styles: []
})
export class OrdersListComponent implements OnInit, OnDestroy {

  monthsKey: Array<string> = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  monthIndex: number;
  currentMonth: string;
  currentYear: number;
  year: number;

  monthFormControl = new FormControl({ value: new Date(), disabled: true });

  disableTooltips = new FormControl(false);

  filteredOrders: Array<Requirement> = [];

  displayedColumns: string[] = ['correlative', 'regDate', 'quotation', 'document', 'totalImport', 'paidImport', 'indebtImport', 'cash', 'deliveryDate', 'description', 'files', 'status', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.monthIndex = this.monthFormControl.value.getMonth();
    this.currentMonth = this.monthsKey[this.monthIndex];
    this.currentYear = this.monthFormControl.value.getFullYear();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    const order$ =
      this.dbs.currentDataOrders.subscribe(res => {
        if (res) {
          this.filteredOrders = res;
          this.dataSource.data = res;
        }
      });

    this.subscriptions.push(order$);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterData(ref: string): void {
    
  }

  setMonthOfView(event, datepicker): void {
    this.monthFormControl = new FormControl({ value: event, disabled: true });
    this.monthIndex = this.monthFormControl.value.getMonth();
    this.currentMonth = this.monthsKey[this.monthIndex];
    this.currentYear = this.monthFormControl.value.getFullYear();
    let fromDate: Date = new Date(this.currentYear, this.monthIndex, 1);

    let toMonth = (fromDate.getMonth() + 1) % 12;
    let toYear = this.currentYear;

    if (toMonth + 1 >= 13) {
      toYear++;
    }

    let toDate: Date = new Date(toYear, toMonth, 1);

    this.dbs.getOrders(fromDate.valueOf(), toDate.valueOf());

    datepicker.close();
  }

  editOrder(order: Order): void {
    this.dialog.open(OrdersListEditDialogComponent, {
      data: {
        order: order
      }
    });
  }

  cancelOrder(order: Order): void {
    if (order.status === 'Enviado') {
      this.dialog.open(OrdersListCancelConfirmComponent, {
        data: {
          order: order
        }
      })
    } else {
      this.snackbar.open('No se pueden anular pedidos APROBADOS o RECHAZADOS', 'Cerrar', {
        duration: 8000
      })
    }
  }

  restoreOrder(order: Order): void {
    if (order.status === 'Anulado') {
      this.dialog.open(OrdersListRestoreConfirmComponent, {
        data: {
          order: order
        }
      })
    } else {
      this.snackbar.open('No se pueden restaurar pedidos APROBADOS o RECHAZADOS', 'Cerrar', {
        duration: 8000
      });
    }
  }

  previewOrder(order: Order): void {
    //
  }

  printOrder(order: Order): void {
    //
  }

}
