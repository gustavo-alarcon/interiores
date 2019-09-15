import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { TotalImports, CashOpening } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ShowHistoryTransactionsDialogComponent } from '../show-history-transactions-dialog/show-history-transactions-dialog.component';
import { ShowHistoryTransactionsTotalDialogComponent } from '../show-history-transactions-total-dialog/show-history-transactions-total-dialog.component';

@Component({
  selector: 'app-show-history-dialog',
  templateUrl: './show-history-dialog.component.html',
  styles: []
})
export class ShowHistoryDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'openingDate', 'closureDate', 'openingBalance', 'totalImport', 'totalTickets', 'totalDepartures', 'closureBalance', 'openedBy', 'closedBy', 'actions'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  disableTooltips = new FormControl(false);

  openings: Array<CashOpening> = [];

  subscriptions: Array<Subscription> = [];
  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TotalImports
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    const opening$ =
      this.dbs.cashListCollection
        .doc(this.data.currentCash.id)
        .collection<CashOpening>('openings', ref => ref.orderBy('openingDate', 'desc'))
        .valueChanges()
        .pipe(
          map(res => {
            res.forEach((element, index) => {
              element['index'] = res.length - index;
            });
            return res;
          })
        )
        .subscribe(res => {
          if (res) {
            if (!(!!res[0].totalImport)) {
              res.shift();
            }

            this.openings = res;
            this.dataSource.data = res;
          }
        });

    this.subscriptions.push(opening$);
  }

  showTransactions(opening: CashOpening): void {
    this.dialog.open(ShowHistoryTransactionsDialogComponent, {
      data: {
        currentCash: this.data.currentCash,
        openingId: opening.id
      }
    });
  }

  showTotal(opening: CashOpening): void {
    this.dialog.open(ShowHistoryTransactionsTotalDialogComponent, {
      data: {
        currentCash: this.data.currentCash,
        totalImport: opening.totalImport,
        totalTickets: opening.totalTickets,
        totalDepartures: opening.totalDepartures,
        totalTicketsByPaymentType: opening.totalTicketsByPaymentType,
        totalDeparturesByPaymentType: opening.totalDeparturesByPaymentType
      }
    });
  }

}
