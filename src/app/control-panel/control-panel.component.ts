import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Participant} from '../active-session/model/session.model';
import {MatDialog, MatDialogConfig} from "@angular/material";
import {JoinSessionDialogComponent} from "../join-session-dialog/join-session-dialog.component";

@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {
  @Input() participant: Participant;
  @Output() participantJoined: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() participantLeft: EventEmitter<Participant> = new EventEmitter<Participant>();

  constructor(private dialog: MatDialog) {
  }


  joinSession = () => {
    const dialogRef = this.dialog.open(JoinSessionDialogComponent, this.getDialogConfig());

    dialogRef.afterClosed().subscribe((participant: Participant) => {
      this.participantJoined.emit(participant);
    });
  }

  leaveSession = () => {
    this.participantLeft.emit(this.participant);
  }

  private getDialogConfig = () => {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      participant: 'Identify Yourself!'
    };
    return dialogConfig;
  }

}
