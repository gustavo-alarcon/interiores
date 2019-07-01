import { DatabaseService } from './../../../../core/database.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Requirement } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { RequirementsListEditDialogComponent } from './requirements-list-edit-dialog/requirements-list-edit-dialog.component';
import { RequirementsListDeleteConfirmComponent } from './requirements-list-delete-confirm/requirements-list-delete-confirm.component';

@Component({
  selector: 'app-requirements-list',
  templateUrl: './requirements-list.component.html',
  styles: []
})
export class RequirementsListComponent implements OnInit, OnDestroy {

  disableTooltips = new FormControl(false);

  filteredRequirements: Array<Requirement> = [];

  displayedColumns: string[] = ['correlative', 'product', 'color', 'quantity', 'description', 'files', 'status', 'requestedBy', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  subscriptions: Array<Subscription> = [];
  
  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort  = this.sort;

    const req$ =
    this.dbs.currentDataRequirements.subscribe(res => {
      if(res) {
        this.filteredRequirements = res;
        this.dataSource.data = res;
      }
    });

    this.subscriptions.push(req$);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  filterData(ref: string) {
    ref = ref.toLowerCase();
    this.filteredRequirements = this.dbs.requirements.filter(option =>
      ('OR' + option.correlative).toLowerCase().includes(ref) ||
      option.product.name.toLowerCase().includes(ref) ||
      option.color.name.toLowerCase().includes(ref) ||
      option.requestedBy.toString().includes(ref));
    this.dataSource.data = this.filteredRequirements;
  }

  editRequirement(req: Requirement): void {
    this.dialog.open(RequirementsListEditDialogComponent, {
      data: {
        req: req
      }
    });
  }

  deleteRequirement(req: Requirement): void {
    this.dialog.open(RequirementsListDeleteConfirmComponent, {
      data: {
        req: req
      }
    })
  }

  previewRequirement(req: Requirement): void {
    //
  }

  printRequirement(req: Requirement): void {
    //
  }

}
