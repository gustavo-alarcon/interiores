import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { CashOpening, TotalImports } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-show-total-cash-dialog',
  templateUrl: './show-total-cash-dialog.component.html',
  styles: []
})
export class ShowTotalCashDialogComponent implements OnInit {

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
