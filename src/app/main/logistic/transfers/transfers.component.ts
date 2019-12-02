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

  monthsKey: Array<string> = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  monthIndex: number;
  currentMonth: string;
  currentYear: number;
  year: number;

  monthFormControl = new FormControl({ value: new Date(), disabled: true });

  disableTooltips = new FormControl(false);

  filteredTransfers: Array<Transfer> = [];

  displayedColumns: string[] = ['correlative', 'origin', 'destination', 'serialList', 'status', 'createdBy', 'approvedBy', 'carriedBy', 'receivedBy', 'rejectedBy', 'canceledBy', 'actions'];

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
    this.monthIndex = this.monthFormControl.value.getMonth();
    this.currentMonth = this.monthsKey[this.monthIndex];
    this.currentYear = this.monthFormControl.value.getFullYear();
    
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
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
      ('TR' + option.correlative).toLowerCase().includes(ref) ||
      option.origin.name.toLowerCase().includes(ref) ||
      option.destination.name.toLowerCase().includes(ref) ||
      option.status.toLowerCase().includes(ref));
    this.dataSource.data = this.filteredTransfers;
  }

  setMonthOfView(event, datepicker): void {
    this.monthFormControl = new FormControl({ value: event, disabled: true });
    this.monthIndex = this.monthFormControl.value.getMonth();
    this.currentMonth = this.monthsKey[this.monthIndex];
    this.currentYear = this.monthFormControl.value.getFullYear();
    let fromDate: Date = new Date(this.currentYear, this.monthIndex, 1);

    let toMonth = (fromDate.getMonth() + 1) % 12;
    let toYear = this.currentYear;

    if (fromDate.getMonth() +  1 >= 12) {
      toYear++;
    }

    let toDate: Date = new Date(toYear, toMonth, 1);

    this.dbs.getTransfers(fromDate.valueOf(), toDate.valueOf());
    this.dbs.getReceptions(fromDate.valueOf(), toDate.valueOf());

    datepicker.close();
  }

  createTransfer(): void {
    this.dialog.open(TransfersCreateDialogComponent);
  }

  showSerialList(serialList: Array<SerialNumber>): void {
    this.dialog.open(TransfersShowSerialListComponent, {
      data: serialList
    })
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
            t.update(this.dbs.transfersCollection.doc(transfer.id).ref, {
              status: 'Anulado',
              approvedBy: '',
              approvedByUid: '',
              approvedDate: null,
              canceledBy: this.auth.userInteriores.displayName,
              canceledByUid: this.auth.userInteriores.uid,
              canceledDate: Date.now(),
             });
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

  rejectTransfer(transfer: Transfer): void {
    let transaction =
      this.af.firestore.runTransaction(t => {
        return t.get(this.dbs.transfersCollection.doc(transfer.id).ref)
          .then(doc => {
            let serialRef;

            if (transfer.origin.name === 'Productos acabados') {
              serialRef =
                this.dbs.finishedProductsCollection
                  .doc(transfer.serialList[0].productId)
                  .collection('products')
                  .doc(transfer.serialList[0].id)
            } else {
              serialRef =
                this.dbs.storesCollection
                  .doc(transfer.origin.id)
                  .collection('products')
                  .doc(transfer.serialList[0].productId)
                  .collection('products')
                  .doc(transfer.serialList[0].id)
            }

            t.update(this.dbs.transfersCollection.doc(transfer.id).ref, {
              status: 'Rechazado',
              rejectedBy: this.auth.userInteriores.displayName,
              rejectedByUid: this.auth.userInteriores.uid,
              rejectedDate: Date.now(),
            });
            t.update(serialRef.ref, {status: 'Acabado'});

          });
      }).then(() => {
        this.snackbar.open(`Traslado #${transfer.correlative} RECHAZADO!`, 'Cerrar', {
          duration: 6000
        });
      })
  }

}
