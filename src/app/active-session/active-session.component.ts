import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SocketService} from '../services/socket.service';
import {filter, flatMap, map, tap} from 'rxjs/operators';
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
  PointSubmittedForParticipantPayload, ReberoniMessage, ReberoniPayload,
  ResetPointsForSessionMessage,
  ResetPointsForSessionPayload,
  RevealPointsForSessionMessage,
  RevealPointsForSessionPayload,
  SpMessage, VotingSchemeChangedPayload, VotingSchemeMessgae
} from './model/events.model';
import {Participant, StoryPointSession} from './model/session.model';
import {
  MatSelectChange,
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition
} from '@angular/material';
import {ThemeService} from '../services/theme.service';
import {ParticipantFilterPipe} from '../pipe/participant-filter.pipe';
import {AlertSnackbarComponent} from '../alert-snackbar/alert-snackbar.component';
import {PointVisibilityChange} from '../control-panel/control-panel.component';
import {Ballot} from '../vote-display/ballot-display.component';
import {LocalStorageService} from '../services/local-storage.service';
import {AppState, Session, SessionSettings} from '../services/local-storage.model';
import {DefaultPointSelection, PointSelection} from '../point-selection/point-selection';


@Component({
  selector: 'app-active-session',
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss', './reberoni.scss'],
  providers: [ParticipantFilterPipe]
})

export class ActiveSessionComponent implements OnInit, OnDestroy {
  logs: string[] = [];
  showLogs: boolean;
  ballots: Ballot[] = [];
  pointSelection: PointSelection = new DefaultPointSelection();

  participant: Participant;
  isDarkTheme: boolean;
  successSound: HTMLAudioElement;

  session: StoryPointSession = new StoryPointSession();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private socketService: SocketService,
              private themeService: ThemeService,
              private snackBar: MatSnackBar,
              private localStorage: LocalStorageService) {
  }

  getSessionName = () =>
    this.session.sessionName;

  ngOnInit() {
    this.socketService.connect();

    this.successSound = new Audio('assets/sounds/ohyeah.mp3');

    this.localStorage.stateEventStream().subscribe((state: AppState) => {
      const maybeSession = state.getSessionBy(this.session.sessionId);

      if (maybeSession) {
        this.showLogs = maybeSession.settings.showEventLog;
      }
    });

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
        tap(this.setSessionIfNotInLocalStorage),
        tap(this.setUserIfAlreadyJoined),
        map(this.handleEvents),
      )
      .subscribe();

    this.themeService.isDarkTheme.subscribe(isIt => this.isDarkTheme = isIt);
  }

  ngOnDestroy(): void {
    // this.socketService.unsubscribe();
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
    this.participant.setPoint(vote.value);
    this.submit();
  };

  changePointVisibility = (state: PointVisibilityChange) => {
    switch (state) {
      case 'reset':
        this.resetPoints();
        break;
      case 'reveal':
        this.revealPoints();
        break;
      default:
        break;
    }
  };

  resetPoints = () => {
    this.socketService.send(new ResetPointsForSessionMessage(new ResetPointsForSessionPayload(this.session.sessionId)));
  };

  revealPoints = () => {
    this.socketService.send(new RevealPointsForSessionMessage(new RevealPointsForSessionPayload(this.session.sessionId)));
    const points = this.session.participants.map(p => p.point);
    if (points.length > 1 && points.every(point => point === points[0])) {
      this.successSound.play();
    }
  };

  joinSession = (maybeNewParticipant: Participant, isAdmin: boolean = false) => {
    if (maybeNewParticipant) {
      this.participant = maybeNewParticipant;

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

  leaveSession = (_: Participant) => {
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

  isMyCard = (cardId: string) =>
    this.participant ? this.participant.participantName === cardId : false;

  collectBallots = (): Ballot[] =>
    this.session.participants.filter((p: Participant) => p.hasVoted).map((p: Participant) => p.point);


  pointSelectionChanged = (pointSelection: PointSelection) => {
    if (pointSelection) {
      this.pointSelection = pointSelection;
      const message = `Voting Scheme changed to ${pointSelection.votingScheme}`;
      this.logs.unshift(message);
      this.showInfoBar(message, 'happy');
    }
  };

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
  };


  private setSessionName = (messageData: GetSessionNameMessage) => {
    this.session.sessionName = messageData.payload.sessionName;
  };

  private eventsOnlyForThisSession = (message: SpMessage): boolean => {
    const targetSession = message.payload.sessionId;

    return this.session.sessionId === targetSession;
  };

  private setSessionIfNotInLocalStorage = () => {
    if (!this.localStorage.getSession(this.session.sessionId)) {
      this.localStorage.setSession(this.session.sessionId, new Session({} as Participant, new SessionSettings()));
    }
  };

  private setUserIfAlreadyJoined = () => {
    const user = this.localStorage.getUser(this.session.sessionId);
    if (user && user.participantName !== undefined) {
      this.participant =
        new Participant(user.participantName, user.participantId, user.point, user.hasVoted, user.isAdmin, user.pointsVisible);
    }
  };

  private handleEvents = (messageData: SpMessage) => {
    const eventType = messageData.eventType;
    const payload = messageData.payload;

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
      case Events.REBERONI:
        this.setReberoni(messageData as ReberoniMessage);
        break;
      default:
        console.log('not matched', eventType);
    }
  };

  private setReberoni = (messageData: ReberoniMessage) => {
    this.reeberoniTime = messageData.payload.showReberoni;
    this.reeberoniCount = 0;
  };

  private verifyPayloadAndUpdate = (payload: any, updateFunction: any, messageData: any) => {
    if (!payload) {
      this.router.navigate(['/'], {queryParams: {error: 1}});
    } else {
      updateFunction(messageData);
      this.ballots = this.collectBallots();
    }
  };

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

    this.logs.unshift(message);
    this.showInfoBar(message, 'happy');
    this.localStorage.setUser(this.session.sessionId, this.participant);
    this.updateSession(messageData);
  };

  private participantRemoved = (messageData: ParticipantRemovedSessionMessage) => {
    const {userName} = messageData.payload;
    const itWasMe = this.wasItMe(userName);
    const message = itWasMe ? 'You left' : `${userName} left.`;

    if (itWasMe) {
      this.clearLocalUserState();
    }

    this.logs.unshift(message);
    this.showInfoBar(message, 'warn');
    this.localStorage.removeUser(this.session.sessionId);
    this.updateSession(messageData);
  };

  private wasItMe = (userName: string): boolean => {
    const yourName = this.participant ? this.participant.participantName : '';
    return yourName === userName;
  };

  private recoverUser = (session: StoryPointSession): void => {
    const maybeRecoveredUserEntry = this.localStorage.getSession(session.sessionId);

    if (maybeRecoveredUserEntry) {
      this.participant = Object.assign(new Participant(), maybeRecoveredUserEntry);
    }
  };

  private refreshParticipants = (session: StoryPointSession) => {
    const participants = session.participants;
    this.setParticipantsInSession(participants);
    this.ensureYouAreStillActive(participants);
  };

  private setParticipantsInSession = (participants: Participant[]) => {
    this.session.loadParticipants(participants);
    this.setIdForLocalUser(participants);
  };

  private setIdForLocalUser = (participants: any[]) => {
    participants.forEach((p: { participantName: string, participantId: number }) => {
      if (this.participant && p.participantName === this.participant.participantName) {
        this.participant.participantId = p.participantId;
      }
    });
  };

  private ensureYouAreStillActive = (participants: any[]) => {
    const youAreStillHere = participants.find((participant: Participant) => {
      return this.participant && participant.participantId === this.participant.participantId;
    });

    if (!youAreStillHere) {
      this.clearLocalUserState();
    }
  };

  private clearLocalUserState = () => {
    this.localStorage.removeUser(this.session.sessionId);
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
  };

  reeberoniTime: boolean;
  reeberoniCode = [
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'KeyR'
  ];
  reeberoniCount = 0;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === this.reeberoniCode[this.reeberoniCount]) {
      this.reeberoniCount++;
    }

    if (this.reeberoniCount === this.reeberoniCode.length) {
      this.reeberoniTime = true;
      this.socketService.send(
        new ReberoniMessage(
          new ReberoniPayload(
            this.session.sessionId,
            this.reeberoniTime
          )
        )
      );
    }
  }

  removeReberoni = () => {
    this.reeberoniTime = false;
    this.reeberoniCount = 0;
    this.socketService.send(
      new ReberoniMessage(
        new ReberoniPayload(
          this.session.sessionId,
          this.reeberoniTime
        )
      )
    );
  };
}
