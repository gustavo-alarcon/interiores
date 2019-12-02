import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Transfer, SerialNumber } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { ReceptionsShowSerialListComponent } from './receptions-show-serial-list/receptions-show-serial-list.component';

@Component({
  selector: 'app-receptions',
  templateUrl: './receptions.component.html',
  styles: []
})
export class ReceptionsComponent implements OnInit, OnDestroy {

  monthsKey: Array<string> = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  monthIndex: number;
  currentMonth: string;
  currentYear: number;
  year: number;

  monthFormControl = new FormControl({ value: new Date(), disabled: true });

  disableTooltips = new FormControl(false);

  filteredReceptions: Array<Transfer> = [];

  displayedColumns: string[] = ['correlative', 'origin', 'destination', 'serialList', 'status', 'createdBy', 'carriedBy', 'actions'];

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

    const reception$ =
      this.dbs.currentDataReceptions
        .subscribe(res => {
          this.filteredReceptions = res;
          this.dataSource.data = this.filteredReceptions;
        });

    this.subscriptions.push(reception$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterData(ref: string) {
    ref = ref.toLowerCase();
    this.filteredReceptions = this.dbs.receptions.filter(option =>
      ('TR' + option.correlative).toLowerCase().includes(ref) ||
      option.origin.name.toLowerCase().includes(ref) ||
      option.destination.name.toLowerCase().includes(ref) ||
      option.status.toLowerCase().includes(ref));
    this.dataSource.data = this.filteredReceptions;
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

  showSerialList(serialList: Array<SerialNumber>): void {
    this.dialog.open(ReceptionsShowSerialListComponent, {
      data: serialList
    })
  }

  receiveTransfer(transfer: Transfer) {

    let successCounter: number = 0;
    try {
      transfer.transferList.forEach(product => {
        let transactionDestination = this.af.firestore.runTransaction(t => {
          let productDestination: AngularFirestoreDocument;
          if (transfer.destination.name === 'Productos acabados') {
            productDestination = this.dbs.finishedProductsCollection.doc(product.product.id);
          } else {
            productDestination = this.dbs.storesCollection.doc(transfer.destination.id).collection('products').doc(product.product.id);
          }

          return t.get(productDestination.ref)
            .then(doc => {
              if (doc.exists) {
                const stock = doc.data().stock;
                const newStock = stock + product.serialList.length;
                t.update(productDestination.ref, { stock: newStock });
                product.serialList.forEach(serial => {
                  serial.status = 'Acabado';
                  serial.location = transfer.destination.name;
                  const serialDestination = productDestination.collection('products').doc(serial.id);
                  t.set(serialDestination.ref, serial);
                });
              } else {
                product.product.stock = product.serialList.length;
                t.set(productDestination.ref, product.product);
                product.serialList.forEach(serial => {
                  serial.status = 'Acabado';
                  serial.location = transfer.destination.name;
                  const serialDestination = productDestination.collection('products').doc(serial.id);
                  t.set(serialDestination.ref, serial);
                });
              }
            })
        });

        let transactionOrigin = this.af.firestore.runTransaction(async t => {
          let productOrigin: AngularFirestoreDocument;
          if (transfer.origin.name === 'Productos acabados') {
            productOrigin = this.dbs.finishedProductsCollection.doc(product.product.id);
          } else {
            productOrigin = this.dbs.storesCollection.doc(transfer.origin.id).collection('products').doc(product.product.id);
          }

          return t.get(productOrigin.ref)
            .then(doc => {
              const stock = doc.data().stock;
              const newStock = stock - product.serialList.length;
              t.update(productOrigin.ref, { stock: newStock });
              product.serialList.forEach(serial => {
                const serialOrigin = productOrigin.collection('products').doc(serial.id);
                t.delete(serialOrigin.ref);
              });
            })
        });

        successCounter++;
      });

      if (successCounter === transfer.transferList.length) {
        this.dbs.transfersCollection.doc(transfer.id).update({
          status: 'Recibido',
          receivedBy: this.auth.userInteriores.displayName,
          receivedByUid: this.auth.userInteriores.uid,
          receivedDate: Date.now()
        });
        this.snackbar.open(`Traslado #${transfer.correlative} RECIBIDO!`, 'Cerrar', {
          duration: 6000
        });
      }

    } catch (error) {
      console.log(error);
      this.snackbar.open('Hubo un erro recibiendo el traslado!', 'Cerrar', {
        duration: 6000
      });
    }



  }

}
