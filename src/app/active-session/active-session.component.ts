import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SocketService} from '../services/socket.service';
import {filter, flatMap, map} from 'rxjs/operators';
import {Events} from './enum/events';
import {
  GetSessionNameMessage,
  GetSessionNamePayload,
  GetStateForSessionMessage,
  GetStateForSessionPayload,
  ParticipantJoinedSessionMessage,
  ParticipantJoinedSessionPayload,
  ParticipantRemovedSessionMessage,
  ParticipantRemovedSessionPayload,
  PointSubmittedForParticipantMessage,
  PointSubmittedForParticipantPayload,
  ResetPointsForSessionMessage,
  ResetPointsForSessionPayload,
  RevealPointsForSessionMessage,
  RevealPointsForSessionPayload,
  SpMessage
} from './model/events.model';
import {Participant, StoryPointSession} from './model/session.model';
import {
  MatSelectChange,
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import {ThemeService} from '../services/theme.service';
import {ParticipantFilterPipe} from '../pipe/participant-filter.pipe';
import {DefaultPointSelection} from '../point-selection/point-selection';
import {AlertSnackbarComponent} from '../alert-snackbar/alert-snackbar.component';
import {PointVisibilityChange} from "../control-panel/control-panel.component";

@Component({
  selector: 'app-active-session',
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss'],
  providers: [ParticipantFilterPipe]
})

// admin that can also vote

export class ActiveSessionComponent implements OnInit, OnDestroy {
  participant: Participant;

  isDarkTheme: boolean;
  // pointSelection = new DefaultPointSelection();
  session: StoryPointSession = new StoryPointSession();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private socketService: SocketService,
              private themeService: ThemeService,
              private snackBar: MatSnackBar,
              @Inject(LOCAL_STORAGE) private storage: StorageService) {
  }

  getSessionName = () =>
    this.session.sessionName

  ngOnInit() {
    this.socketService.connect();

    this.route.paramMap
      .pipe(
        flatMap((paramMap: any) => {
          const id = paramMap.get('id');
          this.session.sessionId = id;

          this.requestInitialStateOfSessionBy(id);

          return this.socketService.messages();
        })
      )
      .pipe(
        filter(this.eventsOnlyForThisSession),
        map(this.handleEvents),
      )
      .subscribe();


    this.themeService.isDarkTheme.subscribe(isIt => this.isDarkTheme = isIt);
  }

  ngOnDestroy(): void {
    this.socketService.unsubscribe();
  }

  submit = () => {
    const vote = this.participant && this.participant.point ? this.participant.point as string : 'Abstain';
    this.socketService.send(
      new PointSubmittedForParticipantMessage(
        new PointSubmittedForParticipantPayload(
          this.session.sessionId,
          this.participant.participantId,
          this.participant.participantName,
          vote
        )
      )
    );
  };

  voteHasChanged = (vote: MatSelectChange) => {
    console.log('vote!');
    this.participant.setPoint(vote.value);
    this.submit();
  };

  changePointVisibility = (state: PointVisibilityChange) => {
    switch (state) {
      case 'reset':
        this.resetPoints();
        break
      case 'reveal':
        this.revealPoints();
        break;
      default:
        break;
    }
  }

  resetPoints = () => {
    this.socketService.send(new ResetPointsForSessionMessage(new ResetPointsForSessionPayload(this.session.sessionId)));
  };

  revealPoints = () => {
    this.socketService.send(new RevealPointsForSessionMessage(new RevealPointsForSessionPayload(this.session.sessionId)));
  };

  joinSession = (maybeNewParticipant: Participant, isAdmin: boolean = false) => {
    if (maybeNewParticipant) {
      this.participant = maybeNewParticipant;

      this.storage.set(String(this.session.sessionId), JSON.stringify(this.participant));

      this.socketService.send(
        new ParticipantJoinedSessionMessage(
          new ParticipantJoinedSessionPayload(
            this.session.sessionId,
            maybeNewParticipant.participantName,
            isAdmin
          )
        )
      );
    }
  };

  leaveSession = (participant: Participant) => {
    this.socketService.send(
      new ParticipantRemovedSessionMessage(
        new ParticipantRemovedSessionPayload(
          this.participant.participantId,
          this.participant.participantName,
          this.session.sessionId
        )
      )
    );
  };

  lurker = (): boolean => !this.participant;

  youAreTheAdmin = (): boolean => this.participant && this.participant.isAdmin;

  canSeeControlPanel = (): boolean => !this.lurker() && this.youAreTheAdmin();

  isMyCard = (cardId: string) =>
    this.participant ? this.participant.participantName === cardId : false;

  private requestInitialStateOfSessionBy = (id: number): void => {
    this.socketService.send(
      new GetSessionNameMessage(
        new GetSessionNamePayload(id)
      )
    );
    this.socketService.send(
      new GetStateForSessionMessage(
        new GetStateForSessionPayload(id)
      )
    );
  }

  private setSessionName = (messageData: GetSessionNameMessage) => {
    this.session.sessionName = messageData.payload.sessionName;
  }

  private eventsOnlyForThisSession = (message: SpMessage): boolean => {
    const targetSession = message.payload.sessionId;

    return this.session.sessionId === targetSession;
  };

  private handleEvents = (messageData: SpMessage) => {
    const eventType = messageData.eventType;
    const payload = messageData.payload;

    console.log('messageData', messageData);

    switch (eventType) {
      case Events.PARTICIPANT_JOINED:
        this.verifyPayloadAndUpdate(payload, this.participantJoined, messageData);
        break;
      case Events.SESSION_STATE:
        this.verifyPayloadAndUpdate(payload, this.updateSession, messageData);
        break;
      case Events.PARTICIPANT_REMOVED:
        this.verifyPayloadAndUpdate(payload, this.participantRemoved, messageData);
        break;
      case Events.GET_SESSION_NAME:
        this.setSessionName(messageData as GetStateForSessionMessage);
        break;
      default:
        console.log('not matched', eventType);
    }
  };

  private verifyPayloadAndUpdate = (payload: any, updateFunction: any, messageData: any) => {
    if (!payload) {
      this.router.navigate(['/'], {queryParams: {error: 1}});
    } else {
      updateFunction(messageData);
    }
  }

  private updateSession = (messageData: GetStateForSessionMessage | ParticipantJoinedSessionMessage) => {
    const session = Object.assign(new StoryPointSession(), messageData.payload);
    const previousName = this.session.sessionName;
    this.session = session;
    this.session.setName(previousName);

    if (!this.participant) {
      this.recoverUser(session);
    }
    this.refreshParticipants(session);
  };

  private participantJoined = (messageData: ParticipantJoinedSessionMessage) => {
    const {userName} = messageData.payload;
    const itWasMe = this.wasItMe(userName);
    const message = itWasMe ? `You joined as ${userName}` : `${userName} joined.`;

    this.showInfoBar(message, 'happy');
    this.updateSession(messageData);
  };

  private participantRemoved = (messageData: ParticipantRemovedSessionMessage) => {
    const {userName} = messageData.payload;
    const itWasMe = this.wasItMe(userName);
    const message = itWasMe ? 'You left' : `${userName} left.`;

    if (itWasMe) {
      this.clearLocalUserState();
    }

    this.showInfoBar(message, 'warn');
    this.updateSession(messageData);
  };

  private wasItMe = (userName: string): boolean => {
    const yourName = this.participant ? this.participant.participantName : '';

    return yourName === userName;
  }

  private recoverUser = (session: StoryPointSession): void => {
    const maybeRecoveredUserEntry = this.storage.get(String(session.sessionId));

    if (maybeRecoveredUserEntry) {
      this.participant = Object.assign(new Participant(), JSON.parse(maybeRecoveredUserEntry));
    }
  }

  private refreshParticipants = (session: StoryPointSession) => {
    const participants = session.participants;
    this.setParticipantsInSession(participants);
    this.ensureYouAreStillActive(participants);
  };

  private setParticipantsInSession = (participants: Participant[]) => {
    this.session.loadParticipants(participants);
    this.setIdForLocalUser(participants);
  }

  private setIdForLocalUser = (participants: any[]) => {
    participants.forEach((p: { participantName: string, participantId: number }) => {
      if (this.participant && p.participantName === this.participant.participantName) {
        this.participant.participantId = p.participantId;
      }
    });
  }

  private ensureYouAreStillActive = (participants: any[]) => {
    const youAreStillHere = participants.find((participant: Participant) => {
      return this.participant && participant.participantId === this.participant.participantId;
    });

    if (!youAreStillHere) {
      this.clearLocalUserState();
    }
  }

  private clearLocalUserState = () => {
    this.storage.remove(String(this.session.sessionId));
    this.participant = undefined;
  };

  private showInfoBar = (message: string, labelClass: string, duration: number = 2000): void => {
    this.snackBar.openFromComponent(AlertSnackbarComponent, {
      duration,
      horizontalPosition: 'center' as MatSnackBarHorizontalPosition,
      verticalPosition: 'bottom' as MatSnackBarVerticalPosition,
      data: {
        message,
        labelClass
      }
    });
  }
}
