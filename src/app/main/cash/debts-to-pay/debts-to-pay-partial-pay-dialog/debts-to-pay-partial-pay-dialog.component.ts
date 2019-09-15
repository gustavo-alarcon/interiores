import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { Cash, Purchase } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { startWith, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-debts-to-pay-partial-pay-dialog',
  templateUrl: './debts-to-pay-partial-pay-dialog.component.html',
  styles: []
})
export class DebtsToPayPartialPayDialogComponent implements OnInit {

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
    private dialogRef: MatDialogRef<DebtsToPayPartialPayDialogComponent>,
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

    this.dataFormGroup.get('import').valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(res => {
        if (res < 0) {
          this.dataFormGroup.get('import').setValue(0);
          this.snackbar.open(`No puede asignar montos negativos`, 'Cerrar', {
            duration: 6000
          });
        } else {
          if (res > this.currentIndebt) {
            this.dataFormGroup.get('import').setValue(this.currentIndebt);
            this.snackbar.open(`El monto máximo a pagar es ${this.currentIndebt}`, 'Cerrar', {
              duration: 6000
            });
          }
        }
      });
  }

  createForm(): void {
    this.dataFormGroup = this.fb.group({
      cash: [null, [Validators.required]],
      import: [null, [Validators.required]],
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

      let type;

      if (this.dataFormGroup.value['import'] === this.currentIndebt) {
        type = 'TOTAL';
      } else {
        type = 'PARCIAL';
      }

      if (this.data.debt.payments) {
        this.data.debt.payments.push({
          type: type,
          paymentType: this.dataFormGroup.value['paymentType'],
          import: this.dataFormGroup.value['import'],
          cashReference: this.dataFormGroup.value['cash'],
          paidBy: this.auth.userInteriores.displayName,
          paidByUid: this.auth.userInteriores.uid,
          regDate: Date.now()
        });
      } else {
        this.data.debt['payments'] = [{
          type: type,
          paymentType: this.dataFormGroup.value['paymentType'],
          import: this.dataFormGroup.value['import'],
          cashReference: this.dataFormGroup.value['cash'],
          paidBy: this.auth.userInteriores.displayName,
          paidByUid: this.auth.userInteriores.uid,
          regDate: Date.now()
        }];
      }

      let data;

      if (this.dataFormGroup.value['import'] === this.currentIndebt) {
        data = {
          payments: this.data.debt.payments,
          paidImport: this.data.debt.paidImport + this.dataFormGroup.value['import'],
          indebtImport: this.data.debt.indebtImport - this.dataFormGroup.value['import'],
          status: 'Pagado',
          paymentDate: Date.now()
        };
      } else {
        data = {
          payments: this.data.debt.payments,
          paidImport: this.data.debt.paidImport + this.dataFormGroup.value['import'],
          indebtImport: this.data.debt.indebtImport - this.dataFormGroup.value['import'],
        };
      }



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
                  import: this.dataFormGroup.value['import'],
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
                  this.snackbar.open(`Cuenta parcialmente pagada con caja : ${this.dataFormGroup.value['cash'].name}.`, 'Cerrar', {
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
