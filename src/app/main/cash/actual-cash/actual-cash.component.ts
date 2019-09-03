import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TicketProduct, TicketRawMaterial, DepartureProduct, DepartureRawMaterial, Transaction, CurrentCash } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { OpenCashDialogComponent } from './open-cash-dialog/open-cash-dialog.component';
import { AddMoneyCashDialogComponent } from './add-money-cash-dialog/add-money-cash-dialog.component';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/core/auth.service';
import { TransactionCancelConfirmComponent } from './transaction-cancel-confirm/transaction-cancel-confirm.component';
import { TransactionRestoreConfirmComponent } from './transaction-restore-confirm/transaction-restore-confirm.component';
import { TransactionApproveConfirmComponent } from './transaction-approve-confirm/transaction-approve-confirm.component';
import { RetriveMoneyCashDialogComponent } from './retrive-money-cash-dialog/retrive-money-cash-dialog.component';
import { TransactionTicketEditDialogComponent } from './transaction-ticket-edit-dialog/transaction-ticket-edit-dialog.component';
import { TransactionDepartureEditDialogComponent } from './transaction-departure-edit-dialog/transaction-departure-edit-dialog.component';
import { ShowTotalCashDialogComponent } from './show-total-cash-dialog/show-total-cash-dialog.component';
import { CloseCashDialogComponent } from './close-cash-dialog/close-cash-dialog.component';
import { ShowHistoryDialogComponent } from './show-history-dialog/show-history-dialog.component';

@Component({
  selector: 'app-actual-cash',
  templateUrl: './actual-cash.component.html',
  styles: []
})
export class ActualCashComponent implements OnInit, OnDestroy {

  disableTooltips = new FormControl(false);

  filteredOperations: Array<TicketProduct | TicketRawMaterial | DepartureProduct | DepartureRawMaterial> = [];
  filteredTransactions: Array<Transaction> = [];
  referenceTransactions: Array<Transaction> = [];

  displayedColumns: string[] = ['index', 'regDate', 'type', 'description', 'import', 'verified', 'user', 'paymentType', 'destinationAccount', 'originAccount', 'debt', 'approvedBy', 'actions'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  totalImport: number = 0;
  totalTickets: number = 0;
  totalDepartures: number = 0;

  totalTicketsByPaymentType = {
    'TARJETA VISA': 0,
    'TARJETA MASTERCARD': 0,
    'TARJETA ESTILOS': 0,
    'EFECTIVO': 0
  }

  totalDeparturesByPaymentType = {
    'TRANSFERENCIA': 0,
    'EFECTIVO': 0
  }

  totalTicketsTARJETAVISA: number = 0;
  totalTicketsTARJETAMASTERCARD: number = 0;
  totalTicketsTARJETAESTILOS: number = 0;
  totalTicketsEFECTIVO: number = 0;

  currentCash: CurrentCash = null;

  currentCash$: Subscription;
  transaction$: Subscription;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    public af: AngularFirestore,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.currentCash$ =
      this.auth.currentDataUserInteriores
        .subscribe(user => {
          if (user) {
            if (user.currentCash) {
              this.currentCash = user.currentCash;

              this.transaction$ =
                this.af.collection(`db/${this.auth.userInteriores.db}/cashList`)
                  .doc(this.currentCash.id)
                  .collection('openings')
                  .doc(this.currentCash.currentOpening)
                  .collection<Transaction>('transactions', ref => ref.orderBy('regDate', 'desc'))
                  .valueChanges()
                  .pipe(
                    map(res => {
                      this.totalImport = 0;
                      this.totalTickets = 0;
                      this.totalDepartures = 0;

                      this.totalTicketsByPaymentType = {
                        'TARJETA VISA': 0,
                        'TARJETA MASTERCARD': 0,
                        'TARJETA ESTILOS': 0,
                        'EFECTIVO': 0
                      }

                      this.totalDeparturesByPaymentType = {
                        'TRANSFERENCIA': 0,
                        'EFECTIVO': 0
                      }

                      res.forEach((element, index) => {
                        element['index'] = res.length - index - 1;
                        if (element.status === 'Aprobado') {
                          if (element.ticketType) {
                            this.totalImport += element.import;
                            this.totalTickets += element.import;
                            this.totalTicketsByPaymentType[element.paymentType] += element.import;
                          } else {
                            this.totalImport -= element.import;
                            this.totalDepartures += element.import;
                            this.totalDeparturesByPaymentType[element.paymentType] += element.import;
                          }
                        }
                      });
                      return res;
                    })
                  )
                  .subscribe(res => {
                    this.filteredTransactions = res;
                    this.referenceTransactions = res;
                    this.dataSource.data = this.filteredTransactions;
                  });

              this.subscriptions.push(this.transaction$);
            }
          }

        });

    this.subscriptions.push(this.currentCash$);

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterData(ref): void {
    ref = ref.trim().toLowerCase();
    this.dataSource.filter = ref;

    // this.filteredTransactions = this.referenceTransactions.filter(option =>
    //   option.paymentType.toLowerCase().includes(ref) ||
    //   option.type.toLowerCase().includes(ref) ||
    //   option.user.displayName.toLowerCase());

    // this.dataSource.data = this.filteredTransactions;
  }

  showTotal(): void {
    this.dialog.open(ShowTotalCashDialogComponent, {
      data: {
        currentCash: this.currentCash,
        totalImport: this.totalImport,
        totalTickets: this.totalTickets,
        totalDepartures: this.totalDepartures,
        totalTicketsByPaymentType: this.totalTicketsByPaymentType,
        totalDeparturesByPaymentType: this.totalDeparturesByPaymentType
      }
    });
  }

  showHistory(): void {
    this.dialog.open(ShowHistoryDialogComponent, {
      data: {
        currentCash: this.currentCash,
        totalImport: this.totalImport,
        totalTickets: this.totalTickets,
        totalDepartures: this.totalDepartures,
        totalTicketsByPaymentType: this.totalTicketsByPaymentType,
        totalDeparturesByPaymentType: this.totalDeparturesByPaymentType
      }
    });
  }

  addMoney(): void {
    this.dialog.open(AddMoneyCashDialogComponent);
  }

  retriveMoney(): void {
    this.dialog.open(RetriveMoneyCashDialogComponent);
  }

  openCash(): void {
    this.dialog.open(OpenCashDialogComponent);
  }

  closeCash(): void {
    this.dialog.open(CloseCashDialogComponent, {
      data: {
        currentCash: this.currentCash,
        totalImport: this.totalImport,
        totalTickets: this.totalTickets,
        totalDepartures: this.totalDepartures,
        totalTicketsByPaymentType: this.totalTicketsByPaymentType,
        totalDeparturesByPaymentType: this.totalDeparturesByPaymentType
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.currentCash = null;
        this.dataSource.data = [];
      }
    })
  }

  // CASH ACTIONS

  editOpeningBalance(): void {

  }

  editOpeningDate(): void {

  }

  printCash(): void {

  }

  exportCash(): void {

  }

  // TRANSACTION ACTIONS
  approveTransaction(transaction: Transaction): void {
    this.dialog.open(TransactionApproveConfirmComponent, {
      data: {
        transaction: transaction
      }
    })
  }

  editTransaction(transaction: Transaction): void {
    if (transaction.ticketType) {
      this.dialog.open(TransactionTicketEditDialogComponent, {
        data: {
          transaction: transaction
        }
      });
    } else {
      this.dialog.open(TransactionDepartureEditDialogComponent, {
        data: {
          transaction: transaction
        }
      });
    }
  }

  cancelTransaction(transaction: Transaction): void {
    this.dialog.open(TransactionCancelConfirmComponent, {
      data: {
        transaction: transaction
      }
    });
  }

  restoreTransaction(transaction: Transaction): void {
    this.dialog.open(TransactionRestoreConfirmComponent, {
      data: {
        transaction: transaction
      }
    });
  }

}
