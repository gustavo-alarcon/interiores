import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Product, SerialNumber } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { map, debounce, debounceTime } from 'rxjs/operators';
import { CheckStockSellDialogComponent } from './check-stock-sell-dialog/check-stock-sell-dialog.component';
import { CheckStockTransferDialogComponent } from './check-stock-transfer-dialog/check-stock-transfer-dialog.component';
import { AuthService } from 'src/app/core/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { CheckStockSeparateDialogComponent } from './check-stock-separate-dialog/check-stock-separate-dialog.component';

@Component({
  selector: 'app-check-stock',
  templateUrl: './check-stock.component.html',
  styles: []
})
export class CheckStockComponent implements OnInit {

  searching: boolean = false;

  disableTooltips = new FormControl(false);
  product = new FormControl();

  filteredProducts: Observable<Product[]>;

  displayedColumns: string[] = ['index', 'location', 'serie', 'code', 'color', 'sale', 'status', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  results: Array<SerialNumber> = [];
  filteredResults: Array<SerialNumber> = [];

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource.data = this.filteredResults;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.filteredProducts =
      this.product.valueChanges
        .pipe(
          map(value => typeof value === 'string' ? value.toLowerCase() : null),
          map(value => value ? this.dbs.finishedProducts.filter(option => {
            if (option.code && option.name) {
              return option.code.toLowerCase().includes(value) || option.name.toLowerCase().includes(value);
            }
          }) : this.dbs.finishedProducts)
        )
  }

  filterData(ref: string) {
    ref = ref.toLowerCase();
    this.filteredResults = this.results.filter(option =>
      option.color.toLowerCase().includes(ref) ||
      option.status.toLowerCase().includes(ref));
    this.dataSource.data = this.filteredResults;
  }

  searchProduct() {
    this.results = [];
    this.dataSource.data = this.results;
    this.searching = true;

    if (typeof this.product.value === 'object') {
      this.dbs.currentDataStores
        .pipe(
          debounceTime(300)
        )
        .subscribe(stores => {
          this.results = [];
          stores.forEach(store => {
            let sub =
              this.dbs.storesCollection
                .doc(store.id)
                .collection('products')
                .doc(this.product.value['id'])
                .collection<SerialNumber>('products')
                .valueChanges()
                .subscribe(res => {
                  if (res) {

                    res.forEach(serial => {
                      if (serial.code === this.product.value['code'] && serial.status !== 'Vendido') {
                        const temp = this.results.filter(option => (option.code === serial.code) && (option.serie === serial.serie));
                        if (temp.length === 0) {
                          serial['isInFacility'] = false;
                          this.results.push(serial);
                        }
                      }
                    });

                    this.dataSource.data = this.results;
                  }
                });
          });

          this.dbs.finishedProductsCollection
            .doc(this.product.value['id'])
            .collection<SerialNumber>('products')
            .valueChanges()
            .subscribe(res => {
              if (res) {
                res.forEach(serial => {
                  if (serial.code === this.product.value['code'] && serial.status !== 'Vendido') {
                    serial['isInFacility'] = true;
                    this.results.push(serial);
                  }
                });

                this.dataSource.data = this.results;
                this.searching = false;
              }
            })
        })


    }
  }

  showProduct(product: Product): string | null {
    return product ? (product.code + ' | ' + product.name) : null
  }

  selectedProduct(event): void {
    this.searchProduct();
  }

  transferProduct(serial: SerialNumber): void {
    this.dialog.open(CheckStockTransferDialogComponent, {
      data: {
        serial: serial,
        product: this.product.value
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.searchProduct()
      }
    });
  }

  sellProduct(serial: SerialNumber): void {
    this.dialog.open(CheckStockSellDialogComponent, {
      data: {
        serial: serial,
        product: this.product.value
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.searchProduct()
      }
    });
  }

  separateProduct(serial: SerialNumber): void {
    this.dialog.open(CheckStockSeparateDialogComponent, {
      data: {
        serial: serial,
        product: this.product.value
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        this.searchProduct();
      }
    });
  }

}
