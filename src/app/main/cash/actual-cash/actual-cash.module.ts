import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActualCashRoutingModule } from './actual-cash-routing.module';
import { ActualCashComponent } from './actual-cash.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatIconModule, MatInputModule, MatButtonModule, MatAutocompleteModule, MatCheckboxModule, MatTooltipModule, MatDividerModule, MatTableModule, MatPaginatorModule, MatSortModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatProgressBarModule, MatMenuModule, MatSelectModule } from '@angular/material';
import { OpenCashDialogComponent } from './open-cash-dialog/open-cash-dialog.component';
import { OpenCashConfirmComponent } from './open-cash-confirm/open-cash-confirm.component';
import { MatPasswordStrengthModule } from '@angular-material-extensions/password-strength';
import { CloseCashConfirmComponent } from './close-cash-confirm/close-cash-confirm.component';
import { AddMoneyCashDialogComponent } from './add-money-cash-dialog/add-money-cash-dialog.component';
import { RetriveMoneyCashDialogComponent } from './retrive-money-cash-dialog/retrive-money-cash-dialog.component';
import { ShowTotalCashDialogComponent } from './show-total-cash-dialog/show-total-cash-dialog.component';
import { AddMoneyCashConfirmComponent } from './add-money-cash-confirm/add-money-cash-confirm.component';
import { RetriveMoneyCashConfirmComponent } from './retrive-money-cash-confirm/retrive-money-cash-confirm.component';
import { TransactionCancelConfirmComponent } from './transaction-cancel-confirm/transaction-cancel-confirm.component';
import { TransactionRestoreConfirmComponent } from './transaction-restore-confirm/transaction-restore-confirm.component';
import { TransactionApproveConfirmComponent } from './transaction-approve-confirm/transaction-approve-confirm.component';
import { TransactionTicketEditDialogComponent } from './transaction-ticket-edit-dialog/transaction-ticket-edit-dialog.component';
import { TransactionDepartureEditDialogComponent } from './transaction-departure-edit-dialog/transaction-departure-edit-dialog.component';
import { TransactionTicketEditConfirmComponent } from './transaction-ticket-edit-confirm/transaction-ticket-edit-confirm.component';
import { TransactionDepartureEditConfirmComponent } from './transaction-departure-edit-confirm/transaction-departure-edit-confirm.component';
import { CloseCashDialogComponent } from './close-cash-dialog/close-cash-dialog.component';
import { ShowHistoryDialogComponent } from './show-history-dialog/show-history-dialog.component';
import { ShowHistoryTransactionsDialogComponent } from './show-history-transactions-dialog/show-history-transactions-dialog.component';
import { ShowHistoryTransactionsTotalDialogComponent } from './show-history-transactions-total-dialog/show-history-transactions-total-dialog.component';

@NgModule({
  declarations: [
    ActualCashComponent,
    OpenCashDialogComponent,
    OpenCashConfirmComponent,
    CloseCashConfirmComponent,
    AddMoneyCashDialogComponent,
    RetriveMoneyCashDialogComponent,
    ShowTotalCashDialogComponent,
    AddMoneyCashConfirmComponent,
    RetriveMoneyCashConfirmComponent,
    TransactionCancelConfirmComponent,
    TransactionRestoreConfirmComponent,
    TransactionApproveConfirmComponent,
    TransactionTicketEditDialogComponent,
    TransactionDepartureEditDialogComponent,
    TransactionTicketEditConfirmComponent,
    TransactionDepartureEditConfirmComponent,
    CloseCashDialogComponent,
    ShowHistoryDialogComponent,
    ShowHistoryTransactionsDialogComponent,
    ShowHistoryTransactionsTotalDialogComponent
  ],
  imports: [
    CommonModule,
    ActualCashRoutingModule,
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
    MatPasswordStrengthModule,
    MatSelectModule
  ],
  entryComponents: [
    OpenCashDialogComponent,
    OpenCashConfirmComponent,
    CloseCashConfirmComponent,
    AddMoneyCashDialogComponent,
    RetriveMoneyCashDialogComponent,
    ShowTotalCashDialogComponent,
    AddMoneyCashConfirmComponent,
    RetriveMoneyCashConfirmComponent,
    TransactionCancelConfirmComponent,
    TransactionRestoreConfirmComponent,
    TransactionApproveConfirmComponent,
    TransactionTicketEditDialogComponent,
    TransactionDepartureEditDialogComponent,
    TransactionTicketEditConfirmComponent,
    TransactionDepartureEditConfirmComponent,
    CloseCashDialogComponent,
    ShowHistoryDialogComponent,
    ShowHistoryTransactionsDialogComponent,
    ShowHistoryTransactionsTotalDialogComponent
  ]
})
export class ActualCashModule { }
