import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Participant} from '../active-session/model/session.model';
import {MatDialog, MatDialogConfig, MatRadioChange} from '@angular/material';
import {JoinSessionDialogComponent} from '../join-session-dialog/join-session-dialog.component';
import {LocalStorageService} from '../services/local-storage.service';
import {VotingSchemeService} from '../services/voting-scheme.service';
import {VotingScheme} from '../voting-booth/voting.model';
import {SpMessage, VotingSchemeChangedPayload, VotingSchemeMessgae} from '../active-session/model/events.model';
import {SocketService} from '../services/socket.service';
import {Events} from '../active-session/enum/events';
import {AppState} from '../services/local-storage.model';
import {map} from 'rxjs/operators';
import {makePointSelection, PointSelection} from '../point-selection/point-selection';


@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit {
  @Input() sessionId: number;
  @Input() participant: Participant;
  @Input() logs: string[];
  @Input() showLogs: boolean;
  @Output() participantJoined: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() participantLeft: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() pointVisibilityEvent: EventEmitter<PointVisibilityChange> = new EventEmitter<PointVisibilityChange>();
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();
  @Output() pointSelectionChanged = new EventEmitter<PointSelection>();

  showAdminConsole: boolean;
  showEventLog: boolean;
  votingSchemeOptions = [VotingScheme.Fibbonaci, VotingScheme.FistOfFive, VotingScheme.Primes];
  votingScheme: string = this.votingSchemeOptions[0].toString();

  constructor(private dialog: MatDialog,
              private votingService: VotingSchemeService,
              private socketService: SocketService,
              private localStorage: LocalStorageService) {
  }

  ngOnInit(): void {
    this.localStorage.stateEventStream()
      .subscribe((state: AppState) => {
        const maybeSession = state.getSessionBy(this.sessionId);

        if (maybeSession) {
          this.showAdminConsole = maybeSession.settings.showAdminConsole;
          this.showEventLog = maybeSession.settings.showEventLog;
          this.votingScheme = maybeSession.settings.votingScheme;
        }
      });

    this.votingService.votingSchemeValue.subscribe(value => {
      if (value) {
        this.votingScheme = value.toString();
      }
    });

    this.socketService.messages().pipe(
      map(this.handleEvents)
    ).subscribe();
  }

  handleEvents = (messageData: SpMessage) => {
    const eventType = messageData.eventType;
    const payload = messageData.payload as VotingSchemeChangedPayload;

    switch (eventType) {
      case Events.VOTING_SCHEME:
        this.votingService.setVoteScheme(this.sessionId, payload.votingScheme);
        this.pointSelectionChanged.emit(makePointSelection(payload.votingScheme));
        break;
    }
  };

  joinSession = () => {
    const dialogRef = this.dialog.open(JoinSessionDialogComponent, this.getDialogConfig());

    dialogRef.afterClosed().subscribe((participant: Participant) => {
      this.participantJoined.emit(participant);
    });
  };

  leaveSession = () => {
    this.participantLeft.emit(this.participant);
  };

  changePointVisibility = (state: PointVisibilityChange) => {
    this.pointVisibilityEvent.emit(state);
  };

  submitVote = (vote) => {
    this.voteSubmitted.emit(vote);
  };

  setShowAdminConsole = (event) => {
    this.localStorage.setShowAdminConsole(this.sessionId, event.checked);
  };

  setShowEventLog = (event) => {
    this.localStorage.setShowEventLog(this.sessionId, event.checked);
  };

  votingSchemeChanged = (event: MatRadioChange) => {
    this.socketService.send(
      new VotingSchemeMessgae(
        new VotingSchemeChangedPayload(
          this.sessionId,
          event.value
        )
      )
    );
  };

  private getDialogConfig = () => {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      participant: 'Identify Yourself!'
    };
    return dialogConfig;
  };
}

export declare type PointVisibilityChange = 'reset' | 'reveal' | 'hide';

