import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { Purchase } from 'src/app/core/types';
import { PurchasesRegisterCreateDialogComponent } from './purchases-register-create-dialog/purchases-register-create-dialog.component';
import { PurchasesRegisterEditDialogComponent } from './purchases-register-edit-dialog/purchases-register-edit-dialog.component';
import { PurchasesRegisterDeleteConfirmComponent } from './purchases-register-delete-confirm/purchases-register-delete-confirm.component';
import { PurchasesRegisterVerifyConfirmComponent } from './purchases-register-verify-confirm/purchases-register-verify-confirm.component';
import { AuthService } from 'src/app/core/auth.service';
import { PurchasesRegisterShowItemsDialogComponent } from './purchases-register-show-items-dialog/purchases-register-show-items-dialog.component';
import { PurchasesRegisterShowPaymentsDialogComponent } from './purchases-register-show-payments-dialog/purchases-register-show-payments-dialog.component';

@Component({
  selector: 'app-register-documents',
  templateUrl: './register-documents.component.html',
  styles: []
})
export class RegisterDocumentsComponent implements OnInit {

  monthsKey: Array<string> = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  monthIndex: number;
  currentMonth: string;
  currentYear: number;
  year: number;

  monthFormControl = new FormControl({ value: new Date(), disabled: true });

  disableTooltips = new FormControl(false);

  filteredPurchases: Array<Purchase> = [];

  currentDate = Date.now();

  displayedColumns: string[] = ['index', 'regDate', 'documentDate', 'documentType', 'documentSerial', 'documentCorrelative', 'provider','itemsList', 'subtotalImport', 'igvImport', 'totalImport', 'paymentType', 'status', 'creditDate', 'paymentDate', 'paidImport', 'indebtImport', 'payments', 'detractionImport', 'detractionDate', 'createdBy', 'editedBy', 'verifiedByAccountant', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  subscriptions: Array<Subscription> = [];


  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.monthIndex = this.monthFormControl.value.getMonth();
    this.currentMonth = this.monthsKey[this.monthIndex];
    this.currentYear = this.monthFormControl.value.getFullYear();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    const purchase$ =
      this.dbs.currentDataPurchases.subscribe(res => {
        if (res) {
          this.filteredPurchases = res;
          this.dataSource.data = res;
        }
      });

    this.subscriptions.push(purchase$);
  }

  filterData(ref: string): void {
    ref = ref.trim().toLowerCase();
    this.dataSource.filter = ref;
    // this.filteredPurchases = this.dbs.purchases.filter(option =>
    //   option.documentType.toLowerCase().includes(ref) ||
    //   option.provider.name.toLowerCase().includes(ref) ||
    //   option.provider.ruc.toString().includes(ref) ||
    //   option.documentCorrelative.toString().includes(ref) ||
    //   option.createdBy.toLowerCase().includes(ref) ||
    //   (option.editedBy ? option.editedBy.toLowerCase().includes(ref) : false) ||
    //   (option.approvedBy ? option.approvedBy.toLowerCase().includes(ref) : false) ||
    //   option.status.toLowerCase().includes(ref));
    // this.dataSource.data = this.filteredPurchases;
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

    this.dbs.getPurchases(fromDate.valueOf(), toDate.valueOf());

    datepicker.close();
  }

  registerDocument(): void {
    this.dialog.open(PurchasesRegisterCreateDialogComponent);
  }

  showItemsList(list: any): void {
    this.dialog.open(PurchasesRegisterShowItemsDialogComponent, {
      data: {
        itemsList: list
      }
    });
  }

  showPayments(purchase: Purchase): void {
    this.dialog.open(PurchasesRegisterShowPaymentsDialogComponent, {
      data: {
        purchase: purchase
      }
    });
  }

  editPurchase(purchase: Purchase): void {
    this.dialog.open(PurchasesRegisterEditDialogComponent, {
      data: {
        purchase: purchase
      }
    });
  }

  deletePurchase(purchase: Purchase): void {
    this.dialog.open(PurchasesRegisterDeleteConfirmComponent, {
      data: {
        purchase: purchase
      }
    })
  }

  verifyPurchase(purchase: Purchase): void {
    this.dialog.open(PurchasesRegisterVerifyConfirmComponent, {
      data: {
        purchase: purchase,
      }
    });
  }

}
