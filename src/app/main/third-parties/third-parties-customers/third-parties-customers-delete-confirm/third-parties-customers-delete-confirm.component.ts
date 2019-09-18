import { Component, OnInit, Inject } from '@angular/core';
import { Customer } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-third-parties-customers-delete-confirm',
  templateUrl: './third-parties-customers-delete-confirm.component.html',
  styles: []
})
export class ThirdPartiesCustomersDeleteConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    deleted: false,
  }

  constructor(
    public dbs: DatabaseService,
    private dialogRef: MatDialogRef<ThirdPartiesCustomersDeleteConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { customer: Customer }
  ) { }

  ngOnInit() {
  }

  delete(): void {
    this.uploading = true;

    this.dbs.customersCollection
      .doc(this.data.customer.id)
      .delete()
      .then(() => {
        this.flags.deleted = true;
        this.uploading = false;
        this.snackbar.open(`${this.data.customer.name} borrado!`, 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true)
      })
  }

}
