import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Participant} from '../active-session/model/session.model';
import {MatDialog, MatDialogConfig} from "@angular/material";
import {JoinSessionDialogComponent} from "../join-session-dialog/join-session-dialog.component";
import {DefaultPointSelection} from "../point-selection/point-selection";

@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent {
  @Input() participant: Participant;
  @Output() participantJoined: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() participantLeft: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() pointVisibilityEvent: EventEmitter<PointVisibilityChange> = new EventEmitter<PointVisibilityChange>();
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();

  pointSelection = new DefaultPointSelection();
  vote: any;
  showAdminConsole: boolean;

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

  changePointVisibility = (state: PointVisibilityChange) => {
    this.pointVisibilityEvent.emit(state);
  }

  voteHasChanged = (value: any) => {
    this.vote = value;
  }

  submitVote = () => {
    this.voteSubmitted.emit(this.vote);

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

export declare type PointVisibilityChange = 'reset' | 'reveal' | 'hide';
