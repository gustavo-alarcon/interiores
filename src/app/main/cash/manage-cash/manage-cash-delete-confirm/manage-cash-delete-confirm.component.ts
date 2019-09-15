import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { Cash } from 'src/app/core/types';

@Component({
  selector: 'app-manage-cash-delete-confirm',
  templateUrl: './manage-cash-delete-confirm.component.html',
  styles: []
})
export class ManageCashDeleteConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    deleted: false,
  }

  constructor(
    public dbs: DatabaseService,
    private dialogRef: MatDialogRef<ManageCashDeleteConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { cash: Cash}
  ) { }

  ngOnInit() {
  }

  delete(): void {
    this.uploading = true;

    this.dbs.cashListCollection
    .doc(this.data.cash.id)
    .delete()
    .then(() => {
      this.flags.deleted = true;
      this.uploading = false;
      this.snackbar.open(`Caja ${this.data.cash.name} borrada!`, 'Cerrar', {
        duration: 6000
      });
      this.dialogRef.close(true);
    })
  }

}
