import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SeparateProduct, User } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { debounceTime, map, startWith } from 'rxjs/operators';
import { SeparateProductsSellDialogComponent } from './separate-products-sell-dialog/separate-products-sell-dialog.component';
import { SeparateProductsCancelConfirmComponent } from './separate-products-cancel-confirm/separate-products-cancel-confirm.component';
import { SeparateProductsChangeProductDialogComponent } from './separate-products-change-product-dialog/separate-products-change-product-dialog.component';

@Component({
  selector: 'app-separate-products',
  templateUrl: './separate-products.component.html',
  styles: []
})
export class SeparateProductsComponent implements OnInit {

  disableTooltips = new FormControl(false);

  filteredSeparateProducts: Array<SeparateProduct> = [];

  user = new FormControl(null);
  filteredUsers: Observable<User[]>;

  currentDate = Date.now();

  displayedColumns: string[] = ['index', 'document', 'customer', 'product', 'paidImport', 'indebtImport', 'createdBy', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.filteredUsers =
      this.user.valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.displayName.toLowerCase()),
          map(name => name ? this.dbs.users.filter(option => option.displayName.toLowerCase().includes(name)) : this.dbs.users)
        )

    const separateProduct$ =
      this.dbs.currentDataSeparateProducts.subscribe(res => {
        if (res) {
          this.filteredSeparateProducts = res;
          this.dataSource.data = res;
        }
      });

    this.subscriptions.push(separateProduct$);

    const user$ =
      this.user.valueChanges
        .pipe(
          debounceTime(300)
        )
        .subscribe(res => {
          if (res) {
            if (res.uid) {
              const filteredSeparatesByUser = this.filteredSeparateProducts.filter(option => option.createdBy.uid === res.uid);
              this.dataSource.data = filteredSeparatesByUser;
            } else {
              this.dataSource.data = this.filteredSeparateProducts;
            }
          }
        });

    this.subscriptions.push(user$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterData(ref: string): void {
    this.dataSource.filter = ref.trim().toLowerCase();
  }

  showUser(user: User): string | null {
    return user ? user.displayName : null;
  }

  sellProduct(separateProduct: SeparateProduct): void {
    this.dialog.open(SeparateProductsSellDialogComponent, {
      data: {
        separateProduct: separateProduct
      }
    });
  }

  cancelSeparation(separateProduct: SeparateProduct): void {
    this.dialog.open(SeparateProductsCancelConfirmComponent, {
      data: {
        separateProduct: separateProduct
      }
    });
  }

  changeProduct(separateProduct: SeparateProduct): void {
    this.dialog.open(SeparateProductsChangeProductDialogComponent, {
      data: {
        separateProduct: separateProduct
      }
    });
  }

}
