import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThirdPartiesWholesaleRoutingModule } from './third-parties-wholesale-routing.module';
import { ThirdPartiesWholesaleComponent } from './third-parties-wholesale.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule } from '@angular/material';
import { ThirdPartiesWholesaleCreateDialogComponent } from './third-parties-wholesale-create-dialog/third-parties-wholesale-create-dialog.component';
import { ThirdPartiesWholesaleContactsDialogComponent } from './third-parties-wholesale-contacts-dialog/third-parties-wholesale-contacts-dialog.component';
import { ThirdPartiesWholesaleEditDialogComponent } from './third-parties-wholesale-edit-dialog/third-parties-wholesale-edit-dialog.component';
import { ThirdPartiesWholesaleEditConfirmComponent } from './third-parties-wholesale-edit-confirm/third-parties-wholesale-edit-confirm.component';
import { ThirdPartiesWholesaleDeleteConfirmComponent } from './third-parties-wholesale-delete-confirm/third-parties-wholesale-delete-confirm.component';

@NgModule({
  declarations: [
    ThirdPartiesWholesaleComponent,
    ThirdPartiesWholesaleCreateDialogComponent,
    ThirdPartiesWholesaleContactsDialogComponent,
    ThirdPartiesWholesaleEditDialogComponent,
    ThirdPartiesWholesaleEditConfirmComponent,
    ThirdPartiesWholesaleDeleteConfirmComponent
  ],
  imports: [
    CommonModule,
    ThirdPartiesWholesaleRoutingModule,
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
    ThirdPartiesWholesaleCreateDialogComponent,
    ThirdPartiesWholesaleContactsDialogComponent,
    ThirdPartiesWholesaleEditDialogComponent,
    ThirdPartiesWholesaleEditConfirmComponent,
    ThirdPartiesWholesaleDeleteConfirmComponent
  ]
})
export class ThirdPartiesWholesaleModule { }
