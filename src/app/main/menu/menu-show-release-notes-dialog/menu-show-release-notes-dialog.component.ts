import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/core/database.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-menu-show-release-notes-dialog',
  templateUrl: './menu-show-release-notes-dialog.component.html',
  styles: []
})
export class MenuShowReleaseNotesDialogComponent implements OnInit {

  releaseURL: any = '';

  constructor(
    public dbs: DatabaseService,
    public sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.dbs.currentDataReleaseNotes
      .subscribe(res => {
        if (res) {
          this.releaseURL = this.sanitizer.bypassSecurityTrustResourceUrl(res)
        }
      })
  }

}
