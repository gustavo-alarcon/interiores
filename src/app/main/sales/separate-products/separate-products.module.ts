import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeparateProductsRoutingModule } from './separate-products-routing.module';
import { SeparateProductsComponent } from './separate-products.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatSelectModule, MatRadioModule } from '@angular/material';
import { SeparateProductsSellDialogComponent } from './separate-products-sell-dialog/separate-products-sell-dialog.component';
import { SeparateProductsCancelConfirmComponent } from './separate-products-cancel-confirm/separate-products-cancel-confirm.component';
import { SeparateProductsChangeProductDialogComponent } from './separate-products-change-product-dialog/separate-products-change-product-dialog.component';

@NgModule({
  declarations: [
    SeparateProductsComponent,
    SeparateProductsSellDialogComponent,
    SeparateProductsCancelConfirmComponent,
    SeparateProductsChangeProductDialogComponent
  ],
  imports: [
    CommonModule,
    SeparateProductsRoutingModule,
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
    SeparateProductsSellDialogComponent,
    SeparateProductsCancelConfirmComponent,
    SeparateProductsChangeProductDialogComponent
  ]
})
export class SeparateProductsModule { }
