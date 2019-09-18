import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThirdPartiesProvidersRoutingModule } from './third-parties-providers-routing.module';
import { ThirdPartiesProvidersComponent } from './third-parties-providers.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatDatepickerModule, MatNativeDateModule, MatSelectModule } from '@angular/material';
import { ThirdPartiesProvidersCreateDialogComponent } from './third-parties-providers-create-dialog/third-parties-providers-create-dialog.component';
import { ThirdPartiesProvidersContactsDialogComponent } from './third-parties-providers-contacts-dialog/third-parties-providers-contacts-dialog.component';
import { ThirdPartiesProvidersBanksDialogComponent } from './third-parties-providers-banks-dialog/third-parties-providers-banks-dialog.component';
import { ThirdPartiesProvidersEditDialogComponent } from './third-parties-providers-edit-dialog/third-parties-providers-edit-dialog.component';
import { ThirdPartiesProvidersDeleteConfirmComponent } from './third-parties-providers-delete-confirm/third-parties-providers-delete-confirm.component';

@NgModule({
  declarations: [
    ThirdPartiesProvidersComponent,
    ThirdPartiesProvidersCreateDialogComponent,
    ThirdPartiesProvidersContactsDialogComponent,
    ThirdPartiesProvidersBanksDialogComponent,
    ThirdPartiesProvidersEditDialogComponent,
    ThirdPartiesProvidersDeleteConfirmComponent
  ],
  imports: [
    CommonModule,
    ThirdPartiesProvidersRoutingModule,
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
    MatSelectModule
  ],
  entryComponents: [
    ThirdPartiesProvidersCreateDialogComponent,
    ThirdPartiesProvidersContactsDialogComponent,
    ThirdPartiesProvidersBanksDialogComponent,
    ThirdPartiesProvidersEditDialogComponent,
    ThirdPartiesProvidersDeleteConfirmComponent
  ]
})
export class ThirdPartiesProvidersModule { }
