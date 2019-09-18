import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckStockRoutingModule } from './check-stock-routing.module';
import { CheckStockComponent } from './check-stock.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatSelectModule, MatRadioModule } from '@angular/material';
import { CheckStockSellDialogComponent } from './check-stock-sell-dialog/check-stock-sell-dialog.component';
import { CheckStockTransferDialogComponent } from './check-stock-transfer-dialog/check-stock-transfer-dialog.component';
import { CheckStockCreateWholesaleDialogComponent } from './check-stock-create-wholesale-dialog/check-stock-create-wholesale-dialog.component';
import { CheckStockCreateCustomerDialogComponent } from './check-stock-create-customer-dialog/check-stock-create-customer-dialog.component';
import { CheckStockSeparateDialogComponent } from './check-stock-separate-dialog/check-stock-separate-dialog.component';

@NgModule({
  declarations: [
    CheckStockComponent,
    CheckStockSellDialogComponent,
    CheckStockTransferDialogComponent,
    CheckStockCreateWholesaleDialogComponent,
    CheckStockCreateCustomerDialogComponent,
    CheckStockSeparateDialogComponent
  ],
  imports: [
    CommonModule,
    CheckStockRoutingModule,
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
    CheckStockSellDialogComponent,
    CheckStockTransferDialogComponent,
    CheckStockCreateWholesaleDialogComponent,
    CheckStockCreateCustomerDialogComponent,
    CheckStockSeparateDialogComponent
  ]
})
export class CheckStockModule { }
