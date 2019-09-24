import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Product, Store, SerialNumber } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { startWith, map, tap } from 'rxjs/operators';
import { StoresCreateConfirmComponent } from './stores-create-confirm/stores-create-confirm.component';
import { StoresShowSerialsComponent } from './stores-show-serials/stores-show-serials.component';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styles: []
})
export class StoresComponent implements OnInit, OnDestroy {

  disableTooltips = new FormControl(false);

  store = new FormControl('');

  filteredProducts: Array<Product> = [];
  referenceProducts: Array<Product> = [];
  filteredStores: Observable<Store[]>;

  serialNumbersInTransfering: object = {};
  // serialNumbersSold: object = {};
  calculatedStock: object = {};
  calcDone = false;

  currentProductList: Array<Product>;
  currentStore: Store;

  displayedColumns: string[] = ['index', 'code', 'name', 'category', 'description', 'image', 'stock', 'sale', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.filteredStores = this.store.valueChanges
      .pipe(
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
        map(name => name ? this.dbs.stores.filter(option => option['name'].toLowerCase().includes(name)) : this.dbs.stores)
      );

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterData(ref: string) {
    ref = ref.toLowerCase();
    this.filteredProducts = this.referenceProducts.filter(option =>
      option.category.toLowerCase().includes(ref) ||
      option.code.toLowerCase().includes(ref) ||
      option.name.toLowerCase().includes(ref) ||
      option.stock.toString().includes(ref) ||
      option.sale.toString().includes(ref));
    this.dataSource.data = this.filteredProducts;
    // this.dbs.recalcStocks();
  }


  showSelectedStore(store: Store): string | null {
    return store ? store.name : null
  }

  selectedStore(event): void {
    this.currentStore = event.option.value;
    const product$ =
      this.dbs.storesCollection
        .doc<Store>(this.currentStore.id)
        .collection<Product>('products')
        .valueChanges()
        .pipe(
          tap(res => {
            if (res) {
              // LOOKING FOR SERIAL NUMBERS IN TRANSFER STATE
              this.serialNumbersInTransfering = {};
              

              res.forEach(product => {

                if (product.id) {
                  let transferCount = 0;
                  this.calculatedStock[product.id] = null;

                  this.dbs.storesCollection
                    .doc(this.currentStore.id)
                    .collection<Product>('products')
                    .doc(product.id)
                    .collection<SerialNumber>('products', ref => ref.where('status', '==', 'Traslado'))
                    .get()
                    .forEach(snapshots => {
                      this.calculatedStock[product.id] = product.stock;
                      snapshots.forEach(snap => {
                        transferCount++;
                        this.calculatedStock[product.id] = product.stock - transferCount;
                        this.serialNumbersInTransfering[product.id] = transferCount;
                      });

                    });
                }

              });
            }
          }),
          map(res => {

            res.forEach((element, index) => {
              element['index'] = index;
            });

            return res;
          })
        )
        .subscribe(res => {
          if (res) {
            this.filteredProducts = res;
            this.referenceProducts = res;
            this.dataSource.data = res;
          }
        });

    this.subscriptions.push(product$);
  }

  createStore(): void {
    this.dialog.open(StoresCreateConfirmComponent)
  }

  showProducts(product: Product): void {
    this.dialog.open(StoresShowSerialsComponent, {
      data: {
        product: product,
        store: this.currentStore
      }
    }).afterClosed().subscribe(res => {

      const _product$ =
        this.dbs.storesCollection
          .doc<Store>(this.currentStore.id)
          .collection<Product>('products')
          .valueChanges()
          .pipe(
            tap(res => {
              if (res) {
                // LOOKING FOR SERIAL NUMBERS IN TRANSFER STATE
                this.serialNumbersInTransfering = {};
                
  
                res.forEach(product => {
  
                  if (product.id) {
                    let transferCount = 0;
                    this.calculatedStock[product.id] = null;
  
                    this.dbs.storesCollection
                      .doc(this.currentStore.id)
                      .collection<Product>('products')
                      .doc(product.id)
                      .collection<SerialNumber>('products', ref => ref.where('status', '==', 'Traslado'))
                      .get()
                      .forEach(snapshots => {
                        this.calculatedStock[product.id] = product.stock;
                        snapshots.forEach(snap => {
                          transferCount++;
                          this.calculatedStock[product.id] = product.stock - transferCount;
                          this.serialNumbersInTransfering[product.id] = transferCount;
                        });
  
                      });
                  }
  
                });
              }
            }),
            map(res => {
              res.forEach((element, index) => {
                element['index'] = index;
              });
              return res;
            })
          )
          .subscribe(res => {
            if (res) {
              this.filteredProducts = res;
              this.referenceProducts = res;
              this.dataSource.data = res;
            }
          });

      this.subscriptions.push(_product$);
    })
  }

}
