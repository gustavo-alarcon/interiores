import { Component, OnInit, Inject } from '@angular/core';
import { Provider } from 'src/app/core/types';
import { DatabaseService } from 'src/app/core/database.service';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-third-parties-providers-delete-confirm',
  templateUrl: './third-parties-providers-delete-confirm.component.html',
  styles: []
})
export class ThirdPartiesProvidersDeleteConfirmComponent implements OnInit {

  uploading: boolean = false;

  flags = {
    deleted: false,
  }

  constructor(
    public dbs: DatabaseService,
    private dialogRef: MatDialogRef<ThirdPartiesProvidersDeleteConfirmComponent>,
    private snackbar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { provider: Provider }
  ) { }

  ngOnInit() {
  }

  delete(): void {
    this.uploading = true;

    this.dbs.providersCollection
      .doc(this.data.provider.id)
      .delete()
      .then(() => {
        this.flags.deleted = true;
        this.uploading = false;
        this.snackbar.open(`${this.data.provider.name} borrado!`, 'Cerrar', {
          duration: 6000
        });
        this.dialogRef.close(true)
      })
  }

}
