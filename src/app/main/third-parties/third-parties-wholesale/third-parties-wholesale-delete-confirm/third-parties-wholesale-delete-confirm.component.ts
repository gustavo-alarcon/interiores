import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { AuthService } from 'src/app/core/auth.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { WholesaleCustomer } from 'src/app/core/types';

@Component({
  selector: 'app-third-parties-wholesale-delete-confirm',
  templateUrl: './third-parties-wholesale-delete-confirm.component.html',
  styles: []
})
export class ThirdPartiesWholesaleDeleteConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    deleted: false,
  }

  constructor(
    public dbs: DatabaseService,
    private dialogRef: MatDialogRef<ThirdPartiesWholesaleDeleteConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { wholesale: WholesaleCustomer }
  ) { }

  ngOnInit() {
  }

  delete(): void {
    this.uploading = true;

    this.dbs.wholesaleCollection
      .doc(this.data.wholesale.id)
      .delete()
      .then(() => {
        this.flags.deleted = true;
        this.uploading = false;
        this.snackbar.open(`${this.data.wholesale.displayName ? this.data.wholesale.displayName : this.data.wholesale.businessName} borrado!`, 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true)
      })
  }

}
