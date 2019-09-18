import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { CurrentCash, Transaction } from 'src/app/core/types';
import { Subscription, pipe } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-show-history-transactions-dialog',
  templateUrl: './show-history-transactions-dialog.component.html',
  styles: []
})
export class ShowHistoryTransactionsDialogComponent implements OnInit {

  displayedColumns: string[] = ['index', 'regDate', 'type', 'description', 'import', 'verified', 'user', 'paymentType', 'debt', 'approvedBy'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  disableTooltips = new FormControl(false);

  currentCash$: Subscription;
  transaction$: Subscription;

  filteredTransactions: Array<Transaction> = [];
  referenceTransactions: Array<Transaction> = [];

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    public af: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: { currentCash: CurrentCash, openingId: string }
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;



    this.transaction$ =
      this.af.collection(`db/${this.auth.userInteriores.db}/cashList`)
        .doc(this.data.currentCash.id)
        .collection('openings')
        .doc(this.data.openingId)
        .collection<Transaction>('transactions', ref => ref.orderBy('regDate', 'desc'))
        .valueChanges()
        .pipe(
          map(res => {
            res.forEach((element, index) => {
              element['index'] = res.length - index - 1;
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
