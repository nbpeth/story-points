import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {Participant} from '../active-session/model/session.model';
import {MatDialog, MatDialogConfig} from "@angular/material";
import {JoinSessionDialogComponent} from "../join-session-dialog/join-session-dialog.component";
import {LOCAL_STORAGE, StorageService} from "ngx-webstorage-service";

@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit {
  @Input() participant: Participant;
  @Output() participantJoined: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() participantLeft: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() pointVisibilityEvent: EventEmitter<PointVisibilityChange> = new EventEmitter<PointVisibilityChange>();
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();

  showAdminConsole: boolean;

  constructor(private dialog: MatDialog,
              @Inject(LOCAL_STORAGE) private storage: StorageService) {
  }

  ngOnInit(): void {
    this.showAdminConsole = this.storage.get('showAdminConsole');
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

  submitVote = (vote) => {
    this.voteSubmitted.emit(vote);
  }

  settingChanged = (event) => {
    console.log(event)
    this.storage.set(event.source.id, event.source.checked)
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
