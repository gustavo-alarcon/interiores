import { Component, OnInit, Inject } from '@angular/core';
import { CashOpening, TotalImports } from 'src/app/core/types';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-show-history-transactions-total-dialog',
  templateUrl: './show-history-transactions-total-dialog.component.html',
  styles: []
})
export class ShowHistoryTransactionsTotalDialogComponent implements OnInit {

  currentOpening: CashOpening;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data: TotalImports
  ) { }

  ngOnInit() {
    const opening$ =
      this.dbs.cashListCollection
        .doc(this.data.currentCash.id)
        .collection('openings')
        .doc<CashOpening>(this.data.currentCash.currentOpening)
        .valueChanges()
        .subscribe(res => {
          if (res) {
            this.currentOpening = res;
          }
        });

    this.subscriptions.push(opening$);
  }

}
