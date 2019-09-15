import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageCashRoutingModule } from './manage-cash-routing.module';
import { ManageCashComponent } from './manage-cash.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule } from '@angular/material';
import { ManageCashCreateDialogComponent } from './manage-cash-create-dialog/manage-cash-create-dialog.component';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { ManageCashEditDialogComponent } from './manage-cash-edit-dialog/manage-cash-edit-dialog.component';
import { ManageCashEditConfirmComponent } from './manage-cash-edit-confirm/manage-cash-edit-confirm.component';
import { ManageCashDeleteConfirmComponent } from './manage-cash-delete-confirm/manage-cash-delete-confirm.component';

@NgModule({
  declarations: [
    ManageCashComponent,
    ManageCashCreateDialogComponent,
    ManageCashEditDialogComponent,
    ManageCashEditConfirmComponent,
    ManageCashDeleteConfirmComponent
  ],
  imports: [
    CommonModule,
    ManageCashRoutingModule,
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
    MatPasswordStrengthModule
  ],
  entryComponents: [
    ManageCashCreateDialogComponent,
    ManageCashEditDialogComponent,
    ManageCashEditConfirmComponent,
    ManageCashDeleteConfirmComponent
  ]
})
export class ManageCashModule { }
