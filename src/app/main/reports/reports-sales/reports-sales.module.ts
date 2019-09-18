import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsSalesRoutingModule } from './reports-sales-routing.module';
import { ReportsSalesComponent } from './reports-sales.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatSelectModule, MatRadioModule, MatNativeDateModule, MatDatepickerModule } from '@angular/material';

@NgModule({
  declarations: [
    ReportsSalesComponent
  ],
  imports: [
    CommonModule,
    ReportsSalesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatMenuModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  entryComponents: [
    
  ]
})
export class ReportsSalesModule { }
