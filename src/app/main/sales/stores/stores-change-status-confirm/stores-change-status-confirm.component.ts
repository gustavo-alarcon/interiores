import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatSnackBar, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SerialNumber, Store, SystemActivityEvent } from 'src/app/core/types';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-stores-change-status-confirm',
  templateUrl: './stores-change-status-confirm.component.html',
  styles: []
})
export class StoresChangeStatusConfirmComponent implements OnInit {

  uploading: boolean = false;
  status = new FormControl();

  statusList: Array<string> = [
    'Acabado',
    'Exhibición',
    'Mantenimiento',
    // 'Separado',
    // 'Vendido',
    'Garantía',
    'Consignacion'
  ]

  constructor(
    public dbs: DatabaseService,
    public auth: AuthService,
    private af: AngularFirestore,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<StoresChangeStatusConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { serial: SerialNumber, store: Store }
  ) { }

  ngOnInit() {
    this.status.setValue(this.data.serial.status);
  }

  change(): void {
    if (this.status.value) {
      this.uploading = true;

      this.dbs.storesCollection
        .doc(this.data.store.id)
        .collection('products')
        .doc(this.data.serial.productId)
        .collection('products')
        .doc(this.data.serial.id)
        .update({
          status: this.status.value,
          modifiedBy: this.auth.userInteriores.displayName,
          modifiedByUid: this.auth.userInteriores.uid
        }).then(() => {
          this.uploading = false;
          this.snackbar.open(`${this.data.serial.name} # ${this.data.serial.serie} actualizado!`, 'Cerrar', {
            duration: 6000
          });
          this.dialogRef.close(true);

          //SYSTEM ACTIVITY LOG ***************
          const event: SystemActivityEvent = {
            id: '',
            event: 'CAMBIO DE ESTADO',
            description: `${this.data.store.name} / ${this.data.serial.code}#${this.data.serial.serie} / ${this.data.serial.status} > ${this.status.value}`,
            module: 'VENTAS',
            section: 'TIENDAS',
            regDate: Date.now(),
            createdBy: this.auth.userInteriores
          }

          this.dbs.systemActivityLogsCollection
            .add(event)
            .then(ref => {
              ref.update({ id: ref.id })
                .then(() => {

                  this.af.firestore.runTransaction(t => {
                    return t.get(this.dbs.systemActivityCounterSalesDocument.ref)
                      .then(doc => {
                        const counter = doc.data().stores;
                        const newCount = counter + 1;

                        t.update(this.dbs.systemActivityCounterSalesDocument.ref, { stores: newCount, lastUpdate: Date.now() });
                      })
                      .catch(err => {
                        console.log(err);
                        this.uploading = false;
                        this.snackbar.open('Hubo un error ejecutando la transacción de actividad de sistema', 'Cerrar', {
                          duration: 6000
                        });
                      })
                  })

                })
            })
            .catch(err => {
              console.log(err);
              this.uploading = false;
              this.snackbar.open('Hubo un error guardando el evento', 'Cerrar', {
                duration: 6000
              });
            });

        }).catch(err => {
          this.uploading = false;
          this.snackbar.open('Hubo un error actualizando el producto', 'Cerrar', {
            duration: 6000
          });
          console.log(err);
        })
    }
  }

}
