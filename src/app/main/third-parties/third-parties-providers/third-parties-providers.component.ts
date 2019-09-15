import { Component, OnInit, ViewChild } from '@angular/core';
import { Provider } from 'src/app/core/types';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { ThirdPartiesProvidersBanksDialogComponent } from './third-parties-providers-banks-dialog/third-parties-providers-banks-dialog.component';
import { ThirdPartiesProvidersEditDialogComponent } from './third-parties-providers-edit-dialog/third-parties-providers-edit-dialog.component';
import { ThirdPartiesProvidersCreateDialogComponent } from './third-parties-providers-create-dialog/third-parties-providers-create-dialog.component';
import { ThirdPartiesProvidersContactsDialogComponent } from './third-parties-providers-contacts-dialog/third-parties-providers-contacts-dialog.component';
import { ThirdPartiesProvidersDeleteConfirmComponent } from './third-parties-providers-delete-confirm/third-parties-providers-delete-confirm.component';

@Component({
  selector: 'app-third-parties-providers',
  templateUrl: './third-parties-providers.component.html',
  styles: []
})
export class ThirdPartiesProvidersComponent implements OnInit {

  disableTooltips = new FormControl(false);

  filteredProviders: Array<Provider> = [];

  displayedColumns: string[] = ['index', 'name', 'ruc', 'address', 'phone', 'detractionAccount', 'bankAccounts', 'contact', 'createdBy','editedBy', 'actions'];


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

    const customer$ =
      this.dbs.currentDataProviders.subscribe(res => {
        if (res) {
          this.filteredProviders = res;
          this.dataSource.data = res;
        }
      });

    this.subscriptions.push(customer$);
  }

  filterData(ref: string): void {
    ref = ref.toLowerCase();
    this.filteredProviders = this.dbs.providers.filter(option =>
      (option.name ? option.name.toLowerCase().includes(ref) : false) ||
      (option.ruc ? option.ruc.toString().includes(ref) : false) ||
      (option.address ? option.address.toString().includes(ref) : false));
    this.dataSource.data = this.filteredProviders;
  }

  createProvider(): void {
    this.dialog.open(ThirdPartiesProvidersCreateDialogComponent);
  }

  openBankAccounts(provider: Provider): void {
    this.dialog.open(ThirdPartiesProvidersBanksDialogComponent, {
      data: {
        provider: provider
      }
    });
  }

  openContactList(provider: Provider): void {
    this.dialog.open(ThirdPartiesProvidersContactsDialogComponent, {
      data: {
        provider: provider
      }
    });
  }

  editProvider(provider: Provider): void {
    this.dialog.open(ThirdPartiesProvidersEditDialogComponent, {
      data: {
        provider: provider
      }
    });
  }

  deleteProvider(provider: Provider): void {
    this.dialog.open(ThirdPartiesProvidersDeleteConfirmComponent, {
      data: {
        provider: provider
      }
    });
  }

}
