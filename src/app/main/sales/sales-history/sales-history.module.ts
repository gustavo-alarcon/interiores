import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesHistoryRoutingModule } from './sales-history-routing.module';
import { SalesHistoryComponent } from './sales-history.component';

import {  MatIconModule,
          MatButtonModule,
          MatFormFieldModule,
          MatAutocompleteModule,
          MatDividerModule,
          MatProgressBarModule,
          MatTableModule,
          MatPaginatorModule,
          MatDatepickerModule,
          MatNativeDateModule,
          MatInputModule} from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [SalesHistoryComponent],
  imports: [
    CommonModule,
    SalesHistoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class SalesHistoryModule { }
