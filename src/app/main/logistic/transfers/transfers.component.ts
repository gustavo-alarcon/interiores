import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Transfer, SerialNumber } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { TransfersCreateDialogComponent } from './transfers-create-dialog/transfers-create-dialog.component';
import { TransfersShowSerialListComponent } from './transfers-show-serial-list/transfers-show-serial-list.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styles: []
})
export class TransfersComponent implements OnInit {

  disableTooltips = new FormControl(false);

  filteredTransfers: Array<Transfer> = [];

  displayedColumns: string[] = ['correlative', 'origin', 'destination', 'serialList', 'status', 'createdBy', 'actions'];

  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog,
    private af: AngularFirestore,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    const transfer$ =
      this.dbs.currentDataTransfers
        .subscribe(res => {
          if (res) {
            this.filteredTransfers = res;
            this.dataSource.data = this.filteredTransfers;
          }
        })
  }

  filterData(ref: string) {
    ref = ref.toLowerCase();
    this.filteredTransfers = this.dbs.transfers.filter(option =>
      ('OR' + option.correlative).toLowerCase().includes(ref) ||
      option.origin.name.toLowerCase().includes(ref) ||
      option.destination.name.toLowerCase().includes(ref) ||
      option.status.toLowerCase().includes(ref));
    this.dataSource.data = this.filteredTransfers;
  }

  createTransfer(): void {
    this.dialog.open(TransfersCreateDialogComponent);
  }

  showSerialList(serialList: Array<SerialNumber>): void {
    this.dialog.open(TransfersShowSerialListComponent)
  }

  approveTransfer(transfer: Transfer): void {
    let transaction =
      this.af.firestore.runTransaction(t => {
        return t.get(this.dbs.transfersCollection.doc(transfer.id).ref)
          .then(doc => {

            if (!transfer.approvedBy) {
              transfer.serialList.forEach(serial => {
                if (transfer.origin.name === "Productos acabados") {
                  this.dbs.finishedProductsCollection
                    .doc(serial.productId)
                    .collection('products')
                    .doc(serial.id)
                    .update({ status: 'Traslado' })
                    .catch(err => {
                      console.log(err);
                    });
                } else {
                  this.dbs.storesCollection
                    .doc(transfer.origin.id)
                    .collection('products')
                    .doc(serial.productId)
                    .collection('products')
                    .doc(serial.id)
                    .update({ status: 'Traslado' })
                    .catch(err => {
                      console.log(err);
                    });
                }
              });
            }
            t.update(this.dbs.transfersCollection.doc(transfer.id).ref,
              {
                status: 'Aprobado',
                approvedBy: this.auth.userInteriores.displayName,
                approvedByUid: this.auth.userInteriores.uid,
                approvedDate: Date.now()
              });
          });
      }).then(() => {
        this.snackbar.open(`Traslado #${transfer.correlative} APROBADO!`, 'Cerrar', {
          duration: 6000
        });
      })
  }

  stopTransfer(transfer: Transfer): void {
    let transaction =
      this.af.firestore.runTransaction(t => {
        return t.get(this.dbs.transfersCollection.doc(transfer.id).ref)
          .then(doc => {
            t.update(this.dbs.transfersCollection.doc(transfer.id).ref, { status: 'Solicitado' });
          });
      }).then(() => {
        this.snackbar.open(`Traslado #${transfer.correlative} DETENIDO!`, 'Cerrar', {
          duration: 6000
        });
      })
  }

  cancelTransfer(transfer: Transfer): void {
    let transaction =
      this.af.firestore.runTransaction(t => {
        return t.get(this.dbs.transfersCollection.doc(transfer.id).ref)
          .then(doc => {
            console.log('serial', transfer.serialList);
            console.log('user', transfer.approvedBy);
            if (transfer.approvedBy) {
              transfer.serialList.forEach(serial => {
                if (transfer.origin.name === "Productos acabados") {
                  this.dbs.finishedProductsCollection
                    .doc(serial.productId)
                    .collection('products')
                    .doc(serial.id)
                    .update({ status: 'Acabado' })
                    .catch(err => {
                      console.log(err);
                    });
                } else {
                  this.dbs.storesCollection
                    .doc(transfer.origin.id)
                    .collection('products')
                    .doc(serial.productId)
                    .collection('products')
                    .doc(serial.id)
                    .update({ status: 'Acabado' })
                    .catch(err => {
                      console.log(err);
                    });
                }
              });
            }
            t.update(this.dbs.transfersCollection.doc(transfer.id).ref, { status: 'Anulado', approvedBy: '', approvedByUid: '', approvedDate: null });
          });
      }).then(() => {
        this.snackbar.open(`Traslado #${transfer.correlative} ANULADO!`, 'Cerrar', {
          duration: 6000
        });
      })
  }

  restoreTransfer(transfer: Transfer): void {
    let transaction =
      this.af.firestore.runTransaction(t => {
        return t.get(this.dbs.transfersCollection.doc(transfer.id).ref)
          .then(doc => {
            t.update(this.dbs.transfersCollection.doc(transfer.id).ref, { status: 'Solicitado' });
          });
      }).then(() => {
        this.snackbar.open(`Traslado #${transfer.correlative} RESTAURADO!`, 'Cerrar', {
          duration: 6000
        });
      })
  }

}
