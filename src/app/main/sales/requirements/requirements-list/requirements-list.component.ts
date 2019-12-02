import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from './../../../../core/database.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Requirement } from 'src/app/core/types';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { RequirementsListEditDialogComponent } from './requirements-list-edit-dialog/requirements-list-edit-dialog.component';
import { RequirementsListCancelConfirmComponent } from './requirements-list-cancel-confirm/requirements-list-cancel-confirm.component';
import { RequirementsListRestoreConfirmComponent } from './requirements-list-restore-confirm/requirements-list-restore-confirm.component';

@Component({
  selector: 'app-requirements-list',
  templateUrl: './requirements-list.component.html',
  styles: []
})
export class RequirementsListComponent implements OnInit, OnDestroy {

  monthsKey: Array<string> = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  monthIndex: number;
  currentMonth: string;
  currentYear: number;
  year: number;

  monthFormControl = new FormControl({ value: new Date(), disabled: true });
  
  disableTooltips = new FormControl(false);

  filteredRequirements: Array<Requirement> = [];

  displayedColumns: string[] = ['correlative', 'regDate', 'product', 'color', 'quantity', 'description', 'files', 'status', 'actions'];


  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  subscriptions: Array<Subscription> = [];

  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.monthIndex = this.monthFormControl.value.getMonth();
    this.currentMonth = this.monthsKey[this.monthIndex];
    this.currentYear = this.monthFormControl.value.getFullYear();

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    const req$ =
      this.dbs.currentDataRequirements.subscribe(res => {
        if (res) {
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
      option.color.toLowerCase().includes(ref));
    this.dataSource.data = this.filteredRequirements;
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

    this.dbs.getRequirements(fromDate.valueOf(), toDate.valueOf());

    datepicker.close();
  }

  editRequirement(req: Requirement): void {
    if (req.status === "Enviado") {
      this.dialog.open(RequirementsListEditDialogComponent, {
        data: {
          req: req
        }
      });
    } else {
      this.snackbar.open('No se pueden editar requerimientos APROBADOS o RECHAZADOS', 'Cerrar', {
        duration: 8000
      });
    }

  }

  cancelRequirement(req: Requirement): void {
    if (req.status === 'Enviado') {
      this.dialog.open(RequirementsListCancelConfirmComponent, {
        data: {
          req: req
        }
      })
    } else {
      this.snackbar.open('No se pueden anular requerimientos APROBADOS o RECHAZADOS', 'Cerrar', {
        duration: 8000
      });
    }

  }

  restoreRequirement(req: Requirement): void {
    if (req.status === 'Anulado') {
      this.dialog.open(RequirementsListRestoreConfirmComponent, {
        data: {
          req: req
        }
      })
    } else {
      this.snackbar.open('No se pueden restaurar requerimientos APROBADOS o RECHAZADOS', 'Cerrar', {
        duration: 8000
      });
    }
  }

  previewRequirement(req: Requirement): void {
    //
  }

  printRequirement(req: Requirement): void {
    //
  }

}
