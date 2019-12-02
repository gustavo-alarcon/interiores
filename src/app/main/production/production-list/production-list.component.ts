import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ProductionOrder, Product } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { ProductionListProduceOpeConfirmComponent } from './production-list-produce-ope-confirm/production-list-produce-ope-confirm.component';
import { ProductionListEditOrderConfirmComponent } from './production-list-edit-order-confirm/production-list-edit-order-confirm.component';

@Component({
  selector: 'app-production-list',
  templateUrl: './production-list.component.html',
  styles: []
})
export class ProductionListComponent implements OnInit, OnDestroy {

  monthsKey: Array<string> = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  monthIndex: number;
  currentMonth: string;
  currentYear: number;
  year: number;

  monthFormControl = new FormControl({ value: new Date(), disabled: true });

  disableTooltips = new FormControl(false);

  filteredProductionOrders: Array<ProductionOrder> = [];

  displayedColumns: string[] = ['correlative', 'regDate', 'corr', 'product', 'document', 'color', 'quantity', 'files', 'description', 'deliveryDate', 'status', 'createdBy', 'approvedBy', 'startedBy', 'finalizedBy', 'actions'];


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

    const raw$ =
      this.dbs.currentDataProductionOrders.subscribe(res => {
        if (res) {
          this.filteredProductionOrders = res;
          this.dataSource.data = res;
        }
      });

    this.subscriptions.push(raw$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterData(ref: string) {
    ref = ref.toLowerCase();
    this.filteredProductionOrders = this.dbs.productionOrders.filter(option =>
      ('OP' + option.correlative).toLowerCase().includes(ref) ||
      ('OR' + option.ORCorrelative).toLowerCase().includes(ref) ||
      ('OPe' + option.OPeCorrelative).toLowerCase().includes(ref) ||
      option.product.name.toLowerCase().includes(ref) ||
      option.quantity.toString().includes(ref) ||
      option.status.toString().includes(ref) ||
      option.createdBy.toString().includes(ref));
    this.dataSource.data = this.filteredProductionOrders;
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

    this.dbs.getProductionOrders(fromDate.valueOf(), toDate.valueOf());

    datepicker.close();
  }

  createProductionOrder(): void {

  }

  startProduction(order: ProductionOrder): void {
    if (order.OPeCorrelative) {
      this.dialog.open(ProductionListProduceOpeConfirmComponent, {
        data: order
      });
    } else {
      this.dbs.productionOrdersCollection
        .doc(order.id)
        .update({
          status: 'Produciendo',
          startedBy: this.auth.userInteriores.displayName,
          startedByUid: this.auth.userInteriores.uid,
          startedDate: Date.now()
        })
        .then(() => {
          this.snackbar.open(`Orden de producción #${order.correlative} en proceso!`, 'Cerrar', {
            duration: 6000
          });
        })
        .catch(err => {
          this.snackbar.open(`Parece que hubo un error iniciando la producción`, 'Cerrar', {
            duration: 6000
          });
          console.log(err);
        })
    }

  }

  editProduction(order: ProductionOrder): void {
    this.dialog.open(ProductionListEditOrderConfirmComponent, {
      data: order
    });
  }

  cancelProduction(order: ProductionOrder): void {
    this.dbs.productionOrdersCollection
      .doc(order.id)
      .update({ status: 'Cancelado' })
      .then(() => {
        this.snackbar.open(`Orden de producción #${order.correlative} cancelada!`, 'Cerrar', {
          duration: 6000
        });
      })
      .catch(err => {
        this.snackbar.open(`Parece que hubo un error cancelando la producción`, 'Cerrar', {
          duration: 6000
        });
        console.log(err);
      })
  }

  finalizeProduction(order: ProductionOrder): void {
    this.dbs.productionOrdersCollection
      .doc(order.id)
      .update({
        status: 'Acabado',
        finalizedBy: this.auth.userInteriores.displayName,
        finalizedByUid: this.auth.userInteriores.uid,
        finalizedDate: Date.now()
      })
      .then(() => {
        let transaction =
          this.af.firestore.runTransaction(t => {
            return t.get(this.dbs.finishedProductsCollection.doc<Product>(order.product.id).ref)
              .then(doc => {

                const ticketsRef = this.af.firestore.collection(this.dbs.ticketsCollection.ref.path).doc();

                const correlative = doc.data().correlative;
                const newStock = doc.data().stock + order.quantity;

                const initSerie = correlative + 1;
                const finalSerie = correlative + order.quantity;

                for (let serie = initSerie; serie <= finalSerie; serie++) {
                  const productsRef = this.af.firestore.collection(this.dbs.finishedProductsCollection.doc(order.product.id).ref.path + '/products').doc();
                  t.set(productsRef, {
                    id: productsRef.id,
                    serie: serie,
                    productId: order.product.id,
                    name: order.product.name,
                    code: order.product.code,
                    status: 'Acabado',
                    location: 'Productos acabados',
                    regDate: Date.now(),
                    createdBy: this.auth.userInteriores.displayName,
                    createdByUid: this.auth.userInteriores.uid,
                    modifiedBy: '',
                    modifiedByUid: '',
                    customerDisplayName: '',
                    customerDocumentNumber: ''
                  });
                }

                t.update(this.dbs.finishedProductsCollection.doc(order.product.id).ref, {
                  stock: newStock,
                  correlative: finalSerie
                });


                t.set(ticketsRef, {
                  id: ticketsRef.id,
                  OPCorrelative: order.correlative,
                  product: order.product,
                  quantity: order.quantity,
                  source: 'production orders',
                  status: 'Grabado',
                  regDate: Date.now(),
                  createdBy: this.auth.userInteriores.displayName,
                  createdByUid: this.auth.userInteriores.uid,
                });

              });
          }).then(() => {
            this.snackbar.open(`Orden de producción #${order.correlative} finalizada!`, 'Cerrar', {
              duration: 6000
            });
          })
      })
      .catch(err => {
        this.snackbar.open(`Parece que hubo un error iniciando la producción`, 'Cerrar', {
          duration: 6000
        });
        console.log(err);
      })
  }

  previewProductionOrder(): void {

  }

  printProductionOrder(): void {

  }

}
