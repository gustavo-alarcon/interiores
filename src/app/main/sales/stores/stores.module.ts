import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoresRoutingModule } from './stores-routing.module';
import { StoresComponent } from './stores.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatSelectModule, MatRadioModule } from '@angular/material';
import { StoresCreateConfirmComponent } from './stores-create-confirm/stores-create-confirm.component';
import { StoresShowSerialsComponent } from './stores-show-serials/stores-show-serials.component';
import { StoresChangeStatusConfirmComponent } from './stores-change-status-confirm/stores-change-status-confirm.component';
import { StoresSellDialogComponent } from './stores-sell-dialog/stores-sell-dialog.component';
import { StoresCreateWholesaleDialogComponent } from './stores-create-wholesale-dialog/stores-create-wholesale-dialog.component';
import { StoresCreateCustomerDialogComponent } from './stores-create-customer-dialog/stores-create-customer-dialog.component';
import { StoresSeparateDialogComponent } from './stores-separate-dialog/stores-separate-dialog.component';

@NgModule({
  declarations: [
    StoresComponent,
    StoresCreateConfirmComponent,
    StoresShowSerialsComponent,
    StoresChangeStatusConfirmComponent,
    StoresSellDialogComponent,
    StoresCreateWholesaleDialogComponent,
    StoresCreateCustomerDialogComponent,
    StoresSeparateDialogComponent
  ],
  imports: [
    CommonModule,
    StoresRoutingModule,
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
    MatRadioModule
  ],
  entryComponents: [
    StoresCreateConfirmComponent,
    StoresShowSerialsComponent,
    StoresChangeStatusConfirmComponent,
    StoresSellDialogComponent,
    StoresCreateWholesaleDialogComponent,
    StoresCreateCustomerDialogComponent,
    StoresSeparateDialogComponent
  ]
})
export class StoresModule { }
