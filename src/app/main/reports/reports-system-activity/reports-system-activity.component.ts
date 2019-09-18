import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SystemActivityEvent, User } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Subscription, Observable } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { startWith, map, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-reports-system-activity',
  templateUrl: './reports-system-activity.component.html',
  styles: []
})
export class ReportsSystemActivityComponent implements OnInit, OnDestroy {

  monthsKey: Array<string> = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  monthIndex: number;
  currentMonth: string;
  currentYear: number;
  year: number;

  dayFormControl = new FormControl({ value: new Date(), disabled: true });

  user = new FormControl(null);
  filteredUsers: Observable<User[]>;

  disableTooltips = new FormControl(false);

  filteredEvents: Array<SystemActivityEvent> = [];

  currentDate = Date.now();

  displayedColumns: string[] = ['index', 'regDate', 'event', 'description', 'module', 'section', 'createdBy'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    const purchase$ =
      this.dbs.currentDataSystemActivityLogs.subscribe(res => {
        if (res) {
          this.filteredEvents = res;
          this.dataSource.data = res;
        }
      });

    this.subscriptions.push(purchase$);

    const date$ =
      this.dayFormControl.valueChanges
        .subscribe(res => {
          if (res) {
            const from = res.getTime();
            const to = from + 86400000;
            this.dbs.getSystemActivityLogs(from, to);
          }
        });

    this.subscriptions.push(date$);

    this.filteredUsers =
      this.user.valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.displayName.toLowerCase()),
          map(name => name ? this.dbs.users.filter(option => option.displayName.toLowerCase().includes(name)) : this.dbs.users)
        )

    const user$ =
      this.user.valueChanges
        .pipe(
          debounceTime(300)
        )
        .subscribe(res => {
          if (res) {
            if (res.uid) {
              const filteredEventsByUser = this.filteredEvents.filter(option => option.createdBy.uid === res.uid);
              this.dataSource.data = filteredEventsByUser;
            }else{
              this.dataSource.data = this.filteredEvents;
            }
          }
        });

    this.subscriptions.push(user$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterData(ref: string): void {
    ref = ref.trim().toLowerCase();
    this.dataSource.filter = ref;
  }

  showUser(user: User): string | null {
    return user ? user.displayName : null;
  }


}
