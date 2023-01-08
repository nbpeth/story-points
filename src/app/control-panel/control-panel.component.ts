import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import {
  CelebrateMessage,
  CelebratePayload,
} from "../active-session/model/events.model";
import { Participant } from "../active-session/model/session.model";
import { ChangePointSchemeComponent } from "../change-point-scheme/change-point-scheme.component";
import { AppState } from "../services/local-storage.model";
import { LocalStorageService } from "../services/local-storage.service";
import { SocketService } from "../services/socket.service";
import { UserService } from "../user.service";

@Component({
  selector: "control-panel",
  templateUrl: "./control-panel.component.html",
  styleUrls: ["./control-panel.component.scss"],
})
export class ControlPanelComponent implements OnInit {
  @Input() sessionId: number;
  @Input() participant: Participant;
  @Input() logs: string[];
  @Input() showLogs: boolean;
  @Input() pointsVisible: boolean;
  @Input() locked: boolean;
  @Input() pointValues?: string;
  @Input() pointSchemeOptions?: any;
  @Output() participantJoined: EventEmitter<Participant> =
    new EventEmitter<Participant>();
  @Output() participantLeft: EventEmitter<Participant> =
    new EventEmitter<Participant>();
  @Output() pointVisibilityEvent: EventEmitter<PointVisibilityChange> =
    new EventEmitter<PointVisibilityChange>();
  @Output() voteSubmitted: EventEmitter<any> = new EventEmitter<any>();

  showAdminConsole: boolean;
  showEventLog = true;
  audioEnabled: boolean;

  constructor(
    public userService: UserService,
    private socketService: SocketService,
    private dialog: MatDialog,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.localStorage.stateEventStream().subscribe((state: AppState) => {
      this.showAdminConsole = state.globals.showAdminConsole;
      this.showEventLog = state.globals.showEventLog;
      this.audioEnabled = state.globals.audioEnabled;
    });
  }

  joinSession = () => {
    const you = this.userService.getLoginUser();
    const youAsAParticipantOfThisSession = new Participant(you.firstName);
    this.participantJoined.emit(youAsAParticipantOfThisSession);
  };

  changePointScheme = () => {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      sessionId: this.sessionId,
      pointSchemeOptions: this.pointSchemeOptions,
      currentScheme: undefined,
    };

    const dialogRef = this.dialog.open(
      ChangePointSchemeComponent,
      dialogConfig
    );

    // dialogRef.afterClosed().subscribe();
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
    this.localStorage.setShowAdminConsole(event.checked);
  };

  setShowEventLog = (event) => {
    this.localStorage.setShowEventLog(event.checked);
  };

  celebrate = () => {
    const payload = new CelebratePayload(
      "fireworks",
      this.userService.getLoginUser().firstName
    );
    payload.sessionId = this.sessionId;
    this.socketService.send(new CelebrateMessage(payload));
  };

  toggleAudio = () => this.localStorage.toggleAudio();
}

export declare type PointVisibilityChange = "reset" | "reveal" | "hide";
