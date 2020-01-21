import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  id: string;
  sessionName: string;
  message: string;

  constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    this.id = data.id;
    this.sessionName = data.sessionName;
    this.message = data.message;
  }


  close = (shouldClose: boolean) => {
    this.dialogRef.close(shouldClose)
  }
}
