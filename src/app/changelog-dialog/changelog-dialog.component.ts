import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-changelog-dialog',
  templateUrl: './changelog-dialog.component.html',
  styleUrls: ['./changelog-dialog.component.scss']
})
export class ChangelogDialogComponent {

  constructor(private dialogRef: MatDialogRef<ChangelogDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: any) {
  }

}
