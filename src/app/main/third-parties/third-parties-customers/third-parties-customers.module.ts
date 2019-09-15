import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThirdPartiesCustomersRoutingModule } from './third-parties-customers-routing.module';
import { ThirdPartiesCustomersComponent } from './third-parties-customers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule } from '@angular/material';
import { ThirdPartiesCustomersCreateDialogComponent } from './third-parties-customers-create-dialog/third-parties-customers-create-dialog.component';
import { ThirdPartiesCustomersEditDialogComponent } from './third-parties-customers-edit-dialog/third-parties-customers-edit-dialog.component';
import { ThirdPartiesCustomersDeleteConfirmComponent } from './third-parties-customers-delete-confirm/third-parties-customers-delete-confirm.component';

@NgModule({
  declarations: [
    ThirdPartiesCustomersComponent,
    ThirdPartiesCustomersCreateDialogComponent,
    ThirdPartiesCustomersEditDialogComponent,
    ThirdPartiesCustomersDeleteConfirmComponent
  ],
  imports: [
    CommonModule,
    ThirdPartiesCustomersRoutingModule,
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
    MatNativeDateModule,
    MatRadioModule
  ],
  entryComponents: [
    ThirdPartiesCustomersCreateDialogComponent,
    ThirdPartiesCustomersEditDialogComponent,
    ThirdPartiesCustomersDeleteConfirmComponent
  ]
})
export class ThirdPartiesCustomersModule { }
