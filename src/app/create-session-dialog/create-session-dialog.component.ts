import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NameBuilder } from '../name-builder';

@Component({
  selector: 'app-create-session-dialog',
  templateUrl: './create-session-dialog.component.html',
  styleUrls: ['./create-session-dialog.component.scss']
})
export class CreateSessionDialogComponent {

  constructor(private dialogRef: MatDialogRef<CreateSessionDialogComponent>) {
  }

  create = (name: string) => {
    const newSessionName = name ? name : NameBuilder.generate();
    this.dialogRef.close(newSessionName);
  }

  cancel = () => {
    this.dialogRef.close();
  }

}
