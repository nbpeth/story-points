import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CelebrateMessage, CelebratePayload, GetPointSchemaOptionsMessage, PointSchemaChangedMessage, PointSchemaChangedPayload } from '../active-session/model/events.model';
import { Participant } from '../active-session/model/session.model';
import { DefaultPointSelection, PointSelection } from '../point-selection/point-selection';
import { AppState } from '../services/local-storage.model';
import { LocalStorageService } from '../services/local-storage.service';
import { SocketService } from '../services/socket.service';
import { UserService } from '../user.service';

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
  @Input() pointsVisible: boolean;
  @Input() locked: boolean;
  @Input() pointValues?: string;
  @Input() pointSchemeOptions?: any;
  @Output() participantJoined: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() participantLeft: EventEmitter<Participant> = new EventEmitter<Participant>();
  @Output() pointVisibilityEvent: EventEmitter<PointVisibilityChange> = new EventEmitter<PointVisibilityChange>();
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();

  showAdminConsole: boolean;
  showEventLog = true;
  audioEnabled: boolean;

  constructor(public userService: UserService,
              private socketService: SocketService,
              private localStorage: LocalStorageService) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    // console.log("pointValues", this.pointValues)
  }

  pointSchemeHasChanged(selection: any) {
    this.socketService.send(new PointSchemaChangedMessage(new PointSchemaChangedPayload(this.sessionId, selection.value.id)));
  }

  ngOnInit(): void {
    this.localStorage.stateEventStream()
      .subscribe((state: AppState) => {
        this.showAdminConsole = state.globals.showAdminConsole;
        this.showEventLog = state.globals.showEventLog;
        this.audioEnabled = state.globals.audioEnabled;
      });
  }

  joinSession = () => {
    const you = this.userService.getLoginUser();
    const youAsAParticipantOfThisSession = new Participant(you.firstName);
    this.participantJoined.emit(youAsAParticipantOfThisSession);
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

  setShowAdminConsole = (event) => {
    this.localStorage.setShowAdminConsole(event.checked);
  }

  setShowEventLog = (event) => {
    this.localStorage.setShowEventLog(event.checked);
  }

  celebrate = () => {
    const payload = new CelebratePayload('fireworks', this.userService.getLoginUser().firstName);
    payload.sessionId = this.sessionId;
    this.socketService.send(new CelebrateMessage(payload));
  }

  toggleAudio = () => this.localStorage.toggleAudio();
}

export declare type PointVisibilityChange = 'reset' | 'reveal' | 'hide';
