import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegisterDocumentsRoutingModule } from './register-documents-routing.module';
import { RegisterDocumentsComponent } from './register-documents.component';
import { PurchasesRegisterCreateDialogComponent } from './purchases-register-create-dialog/purchases-register-create-dialog.component';
import { PurchasesRegisterEditDialogComponent } from './purchases-register-edit-dialog/purchases-register-edit-dialog.component';
import { PurchasesRegisterEditConfirmComponent } from './purchases-register-edit-confirm/purchases-register-edit-confirm.component';
import { PurchasesRegisterDeleteConfirmComponent } from './purchases-register-delete-confirm/purchases-register-delete-confirm.component';
import { PurchasesRegisterVerifyConfirmComponent } from './purchases-register-verify-confirm/purchases-register-verify-confirm.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { PurchasesRegisterAddProviderDialogComponent } from './purchases-register-add-provider-dialog/purchases-register-add-provider-dialog.component';
import { PurchasesRegisterEditItemDialogComponent } from './purchases-register-edit-item-dialog/purchases-register-edit-item-dialog.component';
import { PurchasesRegisterAddRawDialogComponent } from './purchases-register-add-raw-dialog/purchases-register-add-raw-dialog.component';
import { PurchasesRegisterShowItemsDialogComponent } from './purchases-register-show-items-dialog/purchases-register-show-items-dialog.component';
import { PurchasesRegisterShowPaymentsDialogComponent } from './purchases-register-show-payments-dialog/purchases-register-show-payments-dialog.component';

@NgModule({
  declarations: [
    RegisterDocumentsComponent,
    PurchasesRegisterCreateDialogComponent,
    PurchasesRegisterEditDialogComponent,
    PurchasesRegisterEditConfirmComponent,
    PurchasesRegisterDeleteConfirmComponent,
    PurchasesRegisterVerifyConfirmComponent,
    PurchasesRegisterAddProviderDialogComponent,
    PurchasesRegisterEditItemDialogComponent,
    PurchasesRegisterAddRawDialogComponent,
    PurchasesRegisterShowItemsDialogComponent,
    PurchasesRegisterShowPaymentsDialogComponent
  ],
  imports: [
    CommonModule,
    RegisterDocumentsRoutingModule,
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
  ],
  entryComponents: [
    PurchasesRegisterCreateDialogComponent,
    PurchasesRegisterEditDialogComponent,
    PurchasesRegisterEditConfirmComponent,
    PurchasesRegisterDeleteConfirmComponent,
    PurchasesRegisterVerifyConfirmComponent,
    PurchasesRegisterAddProviderDialogComponent,
    PurchasesRegisterEditItemDialogComponent,
    PurchasesRegisterAddRawDialogComponent,
    PurchasesRegisterShowItemsDialogComponent,
    PurchasesRegisterShowPaymentsDialogComponent
  ]
})
export class RegisterDocumentsModule { }
