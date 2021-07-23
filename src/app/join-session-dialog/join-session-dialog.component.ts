import {Component, Inject, OnInit} from '@angular/core';
import {ConfirmDialogComponent} from "../confirm-dialog/confirm-dialog.component";
import {Participant} from "../active-session/model/session.model";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-join-session-dialog',
  templateUrl: './join-session-dialog.component.html',
  styleUrls: ['./join-session-dialog.component.scss']
})
export class JoinSessionDialogComponent implements OnInit {
  name: string;

  constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: any) {
  }

  ngOnInit() {
  }

  joinSession = () => {
    const maybeNewParticipant = new Participant(this.name, undefined, 0, false, false);

    this.dialogRef.close(maybeNewParticipant);
  }

  close = () => {
    this.dialogRef.close(null);
  }

}
