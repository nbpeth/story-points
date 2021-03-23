import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {Participant} from '../active-session/model/session.model';
import {LocalStorageService} from '../services/local-storage.service';
import {DefaultPointSelection, PointSelection} from "../point-selection/point-selection";
import {AppState} from "../services/local-storage.model";
import {UserService} from "../user.service";

@Component({
  selector: 'control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss']
})
export class ControlPanelComponent implements OnInit, OnChanges {
  @Input() sessionId: number;
  @Input() participant: Participant;
  @Input() logs: string[];
  @Input() showLogs: boolean;
  @Input() locked: boolean;
  @Output() participantJoined: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() participantLeft: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() pointVisibilityEvent: EventEmitter<PointVisibilityChange> = new EventEmitter<PointVisibilityChange>();
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();

  showAdminConsole: boolean;
  showEventLog: boolean;

  @Output() pointSelectionChanged = new EventEmitter<PointSelection>();

  constructor(public userService: UserService,
              private localStorage: LocalStorageService) {
  }

  ngOnChanges(changes: any) {
  }

  ngOnInit(): void {
    this.localStorage.stateEventStream()
      .subscribe((state: AppState) => {
        const maybeSession = state.getSessionBy(this.sessionId);

        if (maybeSession) {
          this.showAdminConsole = maybeSession.settings.showAdminConsole;
          this.showEventLog = maybeSession.settings.showEventLog;
        } else {
          this.showEventLog = true;
        }
      });

    this.pointSelectionChanged.emit(new DefaultPointSelection());
  }

  joinSession = () => {
    const you = this.userService.getLoginUser();
    const youAsAParticipantOfThisSession = new Participant(you.firstName);
    this.participantJoined.emit(youAsAParticipantOfThisSession);
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

}

export declare type PointVisibilityChange = 'reset' | 'reveal' | 'hide';
