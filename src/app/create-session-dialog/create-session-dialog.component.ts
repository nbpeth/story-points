import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { NameBuilder } from '../name-builder';

@Component({
  selector: 'app-create-session-dialog',
  templateUrl: './create-session-dialog.component.html',
  styleUrls: ['./create-session-dialog.component.scss']
})
export class CreateSessionDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CreateSessionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any) {
  }

  ngOnInit() {
  }

  create = (name: string) => {

    const newSessionName = name ? name : NameBuilder.generate();

    // const message = new CreateNewSessionMessage(new NewSessionPayload(newSessionName));

    // this.socketService.send(message);


    this.dialogRef.close(newSessionName);
  }

  cancel = () => {
    this.dialogRef.close();
  }

}
