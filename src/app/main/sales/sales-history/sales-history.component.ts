import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth.service';
import { User } from 'src/app/core/types';
import { startWith, map, tap } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'app-sales-history',
  templateUrl: './sales-history.component.html',
  styles: []
})
export class SalesHistoryComponent implements OnInit, OnDestroy {

  currentFrom: Date = new Date();
  currentTo: Date = new Date();

  queryFormGroup: FormGroup;

  loading: boolean = false;

  totalSold: number = 0;

  filteredUsers: Observable<User[]>;

  displayedColumns: string[] = ['index', 'document', 'documentSerial', 'documentCorrelative', 'customer', 'product', 'price', 'createdBy'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createQueryForm();

    this.dataSource.paginator = this.paginator;

    this.filteredUsers =
      this.queryFormGroup.get('user').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.displayName.toLowerCase()),
          map(name => name ? this.dbs.users.filter(option => option.displayName.toLowerCase().includes(name)) : this.dbs.users)
        );

    const departures$ =
      this.dbs.currentDataDepartures
        .pipe(
          tap(res => {
            this.totalSold = 0;
            if (res.length) {
              res.forEach(element => {
                this.totalSold += element.price;
              });
            }
          })
        )
        .subscribe(res => {
          if (res) {
            this.dataSource.data = res;
            this.loading = false;
          }
        });

    this.subscriptions.push(departures$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  createQueryForm(): void {
    this.queryFormGroup = this.fb.group({
      from: [new Date(this.currentFrom.setHours(0, 0, 0, 0)), [Validators.required]],
      to: [this.currentTo, [Validators.required]],
      user: null
    });
  }

  filterData(event): void {
    // this.
  }

  showUser(user: User) {
    return user ? user.displayName : null;
  }

  queryHistory(): void {
    if (this.queryFormGroup.valid) {
      this.loading = true;

      const from = this.queryFormGroup.value['from'].getTime();
      const to = this.queryFormGroup.value['to'].setHours(23, 59, 59, 0);

      let uid;

      if (this.queryFormGroup.value['user'] && (typeof this.queryFormGroup.value['user'] !== 'string')) {
        uid = this.queryFormGroup.value['user']['uid'];
      } else {
        uid = this.auth.userInteriores.uid
      }

      this.dbs.getDepartures(uid, from, to);
    }
  }

  downloadCSV(): void {
    // method to download a CSV file
  }



}
