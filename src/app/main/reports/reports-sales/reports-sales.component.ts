import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { map, startWith } from 'rxjs/operators';
import { Departure, User } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-reports-sales',
  templateUrl: './reports-sales.component.html',
  styles: []
})
export class ReportsSalesComponent implements OnInit, OnDestroy {

  fromFormControl = new FormControl({ value: new Date(), disabled: true });
  toFormControl = new FormControl({ value: new Date(), disabled: true });

  user = new FormControl('');
  filter = new FormControl();

  filteredDepartures: Array<Departure>;
  filteredUsers: Observable<User[]>;

  totalImport = 0;
  totalDiscountedAmount = 0;

  displayedColumns: string[] = ['index', 'regDate', 'document', 'product', 'customer', 'price', 'discountedAmount', 'discount', 'createdBy'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
  ) {
  }

  ngOnInit() {
    const departure$ =
      this.dbs.currentDataDepartures
        .pipe(
          map(res => {
            this.totalImport = 0;
            this.totalDiscountedAmount = 0;

            let filteredByUSer = [];
            res.forEach(element => {
              if (this.user.value['uid']) {
                if (this.user.value['uid'] === element.createdByUid) {
                  if (element.discount) {
                    const discountedAmount = element.price * (100 - element.discount)/100;
                    element['discountedAmount'] = discountedAmount;
                    this.totalImport += element.price;
                    this.totalDiscountedAmount += discountedAmount;
                    filteredByUSer.push(element);
                  }
                }
              } else {
                if (element.discount) {
                  const discountedAmount = element.price * (100 - element.discount)/100;
                  element['discountedAmount'] = discountedAmount;
                  this.totalImport += element.price;
                  this.totalDiscountedAmount += discountedAmount;
                }
              }
            });

            return this.user.value['uid'] ? filteredByUSer : res;
          })
        )
        .subscribe(res => {
          this.filteredDepartures = res;
          this.dataSource.data = res;
        });

    this.subscriptions.push(departure$);

    const from$ =
      this.fromFormControl.valueChanges
        .subscribe(res => {
          if (res) {
            const from = res.getTime();
            const to = this.toFormControl.value.getTime();
            this.dbs.getDepartures(from, to);
          }
        });

    this.subscriptions.push(from$);

    const to$ =
      this.toFormControl.valueChanges
        .subscribe(res => {
          if (res) {
            const from = this.fromFormControl.value.getTime();
            const to = res.getTime();
            this.dbs.getDepartures(from, to);
          }
        });

    this.subscriptions.push(to$);

    this.filteredUsers =
      this.user.valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.displayName.toLowerCase()),
          map(name => name ? this.dbs.users.filter(option => option.displayName.toLowerCase().includes(name)) : this.dbs.users)
        );

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterData(ref): void {
    this.dataSource.filter = ref.toLowerCase();
  }

  showUser(user: User): string | null {
    return user ? user.displayName : null;
  }

  selectedUser(event): void {
    const filteredByUser = this.filteredDepartures.filter(option => option.createdByUid === event.option.value.uid);

    this.totalImport = 0;
    this.totalDiscountedAmount = 0;

    filteredByUser.forEach(element => {
        if (element.discount) {
          const discountedAmount = element.price * (100 - element.discount)/100;
          element['discountedAmount'] = discountedAmount;
          this.totalImport += element.price;
          this.totalDiscountedAmount += discountedAmount;
        }
    });

    this.dataSource.data = filteredByUser;
  }


}
