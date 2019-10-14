import { RawMaterialAddStockDialogComponent } from './raw-material-add-stock-dialog/raw-material-add-stock-dialog.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialog, MatSnackBar, MatTableDataSource, MatPaginator, MatSort, MAT_DIALOG_DATA } from '@angular/material';
import { RawMaterial } from 'src/app/core/types';
import { RawMaterialCreateDialogComponent } from './raw-material-create-dialog/raw-material-create-dialog.component';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { RawMaterialEditDialogComponent } from './raw-material-edit-dialog/raw-material-edit-dialog.component';
import { RawMaterialDeleteConfirmComponent } from './raw-material-delete-confirm/raw-material-delete-confirm.component';
import { RawMaterialSubstractStockDialogComponent } from './raw-material-substract-stock-dialog/raw-material-substract-stock-dialog.component';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-raw-material',
  templateUrl: './raw-material.component.html',
  styles: []
})
export class RawMaterialComponent implements OnInit {

  disableTooltips = new FormControl(false);

  filteredRawMaterials: Array<RawMaterial> = [];

  displayedColumns: string[] = ['index', 'code', 'name', 'category', 'brand', 'stock', 'unit', 'purchase', 'sale', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort  = this.sort;

    const raw$ =
    this.dbs.currentDataRawMaterials.subscribe(res => {
      if(res) {
        this.filteredRawMaterials = res;
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
    this.filteredRawMaterials = this.dbs.rawMaterials.filter(option =>
      option.category.toLowerCase().includes(ref) ||
      option.code.toLowerCase().includes(ref) ||
      option.name.toLowerCase().includes(ref) ||
      option.unit.toLowerCase().includes(ref) ||
      option.stock.toString().includes(ref) ||
      option.purchase.toString().includes(ref) ||
      option.sale.toString().includes(ref));
    this.dataSource.data = this.filteredRawMaterials;
  }

  createRawMaterial(): void {
    this.dialog.open(RawMaterialCreateDialogComponent);
  }

  editRawMaterial(raw: RawMaterial): void {
    this.dialog.open(RawMaterialEditDialogComponent, {
      data: {
        raw: raw
      }
    });
  }

  deleteRawMaterial(raw: RawMaterial): void {
    this.dialog.open(RawMaterialDeleteConfirmComponent, {
      data: {
        raw: raw
      }
    })
  }

  addStock(raw: RawMaterial): void {
    this.dialog.open(RawMaterialAddStockDialogComponent, {
      data: {
        raw: raw,
      }
    });
  }

  substractStock(raw: RawMaterial): void {
    this.dialog.open(RawMaterialSubstractStockDialogComponent, {
      data: {
        raw: raw,
      }
    });
  }

}
