import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth.service';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Purchase, Cash } from 'src/app/core/types';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-debts-to-pay-pay-dialog',
  templateUrl: './debts-to-pay-pay-dialog.component.html',
  styles: []
})
export class DebtsToPayPayDialogComponent implements OnInit {

  loading: boolean = false;

  dataFormGroup: FormGroup;

  filteredCashList: Observable<Cash[]>;

  paidSum: number = 0;
  currentIndebt: number = 0;

  originAccounts = [
    'CUENTA SHIRLEY',
    'CUENTA INTERIORES',
    'CUENTA FERNANDO'
  ]

  paymentTypes = [
    'EFECTIVO',
    'TRANSFERENCIA'
  ]

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<DebtsToPayPayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { debt: Purchase }
  ) { }

  ngOnInit() {

    this.createForm();

    this.paidSum = this.getPaymentsSum(this.data.debt);
    this.currentIndebt = this.data.debt.totalImport - this.paidSum;

    this.filteredCashList =
      this.dataFormGroup.get('cash').valueChanges
        .pipe(
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.name.toLowerCase()),
          map(name => name ? this.dbs.cashList.filter(option => option.name.toLowerCase().includes(name)) : this.dbs.cashList)
        )
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      cash: [null, [Validators.required]],
      paymentType: [null, [Validators.required]],
      originAccount: null
    })
  }

  getPaymentsSum(debt: Purchase): number {
    let sum = 0;

    debt.payments.forEach(element => {
      sum += element.import
    });

    return sum;
  }

  showCash(cash: Cash): string | null {
    return cash ? cash.name : null;
  }

  pay(): void {
    if (this.dataFormGroup.valid) {

      this.loading = true;

      if (this.data.debt.payments) {
        this.data.debt.payments.push({
          type: 'TOTAL',
          paymentType: this.dataFormGroup.value['paymentType'],
          import: this.currentIndebt,
          cashReference: this.dataFormGroup.value['cash'],
          paidBy: this.auth.userInteriores.displayName,
          paidByUid: this.auth.userInteriores.uid,
          regDate: Date.now()
        });
      } else {
        this.data.debt['payments'] = [{
          type: 'TOTAL',
          paymentType: this.dataFormGroup.value['paymentType'],
          import: this.currentIndebt,
          cashReference: this.dataFormGroup.value['cash'],
          paidBy: this.auth.userInteriores.displayName,
          paidByUid: this.auth.userInteriores.uid,
          regDate: Date.now()
        }];
      }

      const data = {
        payments: this.data.debt.payments,
        paidImport: this.data.debt.paidImport + this.dataFormGroup.value['import'],
        indebtImport: this.data.debt.indebtImport - this.dataFormGroup.value['import'],
        status: 'Pagado',
        paymentDate: Date.now()
      };

      this.dbs.debtsToPayCollection
        .doc(this.data.debt.id)
        .update(data)
        .then(() => {
          this.dbs.purchasesCollection
            .doc(this.data.debt.id)
            .update(data)
            .then(() => {
              this.dbs.cashListCollection
                .doc(this.dataFormGroup.value['cash'].id)
                .collection('openings')
                .doc(this.dataFormGroup.value['cash'].currentOpening)
                .collection('transactions')
                .add({
                  id: '',
                  regDate: Date.now(),
                  type: this.data.debt.isRawMaterial ? 'MATERIA PRIMA' : 'GASTO',
                  description: `${this.data.debt.provider.name}, ${this.data.debt.documentType} Serie: ${this.data.debt.documentSerial}, Correlativo: ${this.data.debt.documentCorrelative}`,
                  import: this.currentIndebt,
                  user: this.auth.userInteriores,
                  verified: false,
                  status: 'Grabado',
                  ticketType: null,
                  paymentType: this.dataFormGroup.value['paymentType'],
                  expenseType: null,
                  departureType: this.data.debt.isRawMaterial ? 'MATERIA PRIMA' : 'GASTO',
                  originAccount: this.dataFormGroup.value['originAccount'],
                  debt: 0,
                  lastEditBy: null,
                  lastEditUid: null,
                  lastEditDate: null,
                  approvedBy: null,
                  approvedByUid: null,
                  approvedDate: null
                })
                .then(ref => {
                  ref.update({ id: ref.id })
                  this.loading = false;
                  this.snackbar.open(`Cuenta pagada con caja : ${this.dataFormGroup.value['cash'].name}.`, 'Cerrar', {
                    duration: 15000
                  });
                  this.dialogRef.close(true);
                })
                .catch(err => {
                  this.loading = false;
                  console.log(err);
                  this.snackbar.open('Hubo un error transfiriendo el egreso a caja!', 'Cerrar', {
                    duration: 6000
                  });
                })
            })
            .catch(err => {
              console.log(err);
              this.loading = false;
              this.snackbar.open('Hubo un error actualizando el documento en COMPRAS!', 'Cerrar', {
                duration: 6000
              });
            })
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.snackbar.open('Hubo un error actualizando el documento en CUENTAS POR PAGAR!', 'Cerrar', {
            duration: 6000
          });
        });
    }

  }

}
