import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsSystemActivityRoutingModule } from './reports-system-activity-routing.module';
import { ReportsSystemActivityComponent } from './reports-system-activity.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';

@NgModule({
  declarations: [
    ReportsSystemActivityComponent
  ],
  imports: [
    CommonModule,
    ReportsSystemActivityRoutingModule,
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
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class ReportsSystemActivityModule { }
