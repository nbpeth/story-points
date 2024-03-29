import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SocketService} from '../services/socket.service';
import {flatMap, map} from 'rxjs/operators';
import {combineLatest, Subject} from 'rxjs';
import {Events} from './enum/events';
import {
  CelebrateMessage,
  CelebratePayload,
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
  ShameTimerEndedMessage,
  SpMessage
} from './model/events.model';
import {Participant, StoryPointSession} from './model/session.model';

import {ThemeService} from '../services/theme.service';
import {ParticipantFilterPipe} from '../pipe/participant-filter.pipe';
import {AlertSnackbarComponent} from '../alert-snackbar/alert-snackbar.component';
import {PointVisibilityChange} from '../control-panel/control-panel.component';
import {Ballot} from '../vote-display/ballot-display.component';
import {LocalStorageService} from '../services/local-storage.service';
import {User, UserService} from '../user.service';
import {happy, RandomBuilder} from '../name-builder';
import {SoundService} from '../services/sound-service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {MatSelectChange} from '@angular/material/select';

declare const confetti: any;

@Component({
  selector: 'app-active-session',
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss'],
  providers: [ParticipantFilterPipe]
})

export class ActiveSessionComponent implements OnInit, OnDestroy {
  private participantsInThisSession = new Subject<any>();
  logs: string[] = [];
  showLogs: boolean;
  ballots: Ballot[] = [];
  participant: Participant;
  isDarkTheme: boolean;
  // successSound: HTMLAudioElement;

  iAmShamed: boolean;
  thoseWhoHaveNotVoted: any[];

  session: StoryPointSession = new StoryPointSession();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private socketService: SocketService,
              private themeService: ThemeService,
              private snackBar: MatSnackBar,
              private localStorage: LocalStorageService,
              private soundService: SoundService,
              private userService: UserService) {
  }

  ngOnInit() {
    combineLatest(
      this.userService.userChanges(),
      this.participantsInThisSession
    ).subscribe(([user, participants]) => {
      this.recoverUser(user, participants);
    });

    // this.successSound = new Audio('assets/sounds/hawk.mp3');

    this.route.paramMap
      .pipe(
        flatMap((paramMap: any) => {
          const id = paramMap.get('id');
          this.session.sessionId = id;

          this.socketService.connect(id);

          this.requestInitialStateOfSessionBy(id);

          return this.socketService.messages(id);
        })
      )
      .pipe(
        map(this.handleEvents),
      )
      .subscribe();

    this.themeService.isDarkTheme.subscribe(isIt => this.isDarkTheme = isIt);
  }

  ngOnDestroy(): void {
    this.socketService.close();
  }

  submit = () => {

    const vote = this.participant && this.participant.point ? this.participant.point as string : 'Abstain';
    const me = this.session.participants.find(p => p.loginId === this.participant.loginId);
    // ew, ew ew. need to keep "this.participant" up to date maybe - this is nasty
    this.socketService.send(
      new PointSubmittedForParticipantMessage(
        new PointSubmittedForParticipantPayload(
          this.session.sessionId,
          this.participant.participantId,
          this.participant.participantName,
          vote,
          me && me.pointsVisible
        )
      )
    );
  }

  voteHasChanged = (vote: MatSelectChange) => {
    this.participant.point = vote.value;
    this.submit();
  }

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
  }

  resetPoints = () => {
    this.session.pointsVisible = false;
    this.socketService.send(new ResetPointsForSessionMessage(new ResetPointsForSessionPayload(this.session.sessionId)));
  }

  revealPoints = () => {
    this.session.pointsVisible = true;
    // if all points in the vote match, you get 1 synergy
    const synergized = 1;
    this.socketService.send(new RevealPointsForSessionMessage(new RevealPointsForSessionPayload(this.session.sessionId, synergized)));
    const points = this.session.participants.map(p => ({point: p.point, hasVoted: p.hasVoted}));

    if (points && points.length && points.every(point => {
      return point.hasVoted && point.point === points[0].point;
    })) {
      const payload = new CelebratePayload('synergy');
      payload.sessionId = this.session.sessionId;
      this.socketService.send(new CelebrateMessage(payload));
    }
  }

  joinSession = (maybeNewParticipant: Participant, isAdmin: boolean = false) => {
    if (maybeNewParticipant) {
      this.participant = maybeNewParticipant;
      const {id, email} = this.userService.getLoginUser();

      this.socketService.send(
        new ParticipantJoinedSessionMessage(
          new ParticipantJoinedSessionPayload(
            this.session.sessionId,
            maybeNewParticipant.participantName,
            isAdmin,
            id,
            email
          )
        )
      );
    }
  }

  leaveSession = (_: Participant) => {
    const {id, email} = this.userService.getLoginUser();
    this.socketService.send(
      new ParticipantRemovedSessionMessage(
        new ParticipantRemovedSessionPayload(
          this.participant.participantId,
          this.participant.participantName,
          this.session.sessionId,
          id,
          email
        )
      )
    );
  }

  isMyCard = (card: Participant) => {
    const user = this.userService.getLoginUser();
    return user && card && card.loginId === user.id;
  }

  collectBallots = (): Ballot[] =>
    this.session.participants.filter((p: Participant) => p.hasVoted).map((p: Participant) => p.point)

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
    this.logs.push(`Welcome to ${this.session.sessionName}`);
  }


  private handleEvents = (messageData: SpMessage) => {
    const eventType = messageData.eventType;
    const payload = messageData.payload;
    console.log("message!", messageData)
    switch (eventType) {
      // add event types back for logging, at least
      // each event can still do a whole refresh for now

      // case Events.POINTS_REVEALED:
      //   this.logs.push("Points have been releaved " + JSON.stringify(payload));
      //   break;
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
      case Events.CELEBRATE:
        this.handleCelebration(messageData as CelebrateMessage);
        break;
      case Events.SHAME_TIMER_ENDED:
        this.shameTimerEnded(messageData as ShameTimerEndedMessage);
        break;
      case Events.ACK_SHAME_TIMER_STARTED:
        // block out the timer for everyone during the timer
        const { userName } = messageData.payload as unknown as {userName: string};
        this.logs.unshift(`⚡⚡⚡ ${userName} is reminding you to vote ⚡⚡⚡`);
        this.userService.shameTimerRunning.next(true);
        break;
      default:
        console.log('not matched', messageData);
    }
  }

  private handleCelebration = (messageData: CelebrateMessage) => {
    switch (messageData.payload.celebration) {
      case 'fireworks':
        this.logs.unshift(`🎉🎉🎉 ${messageData.payload.celebrator} is ${RandomBuilder.generateFrom(happy)}`);
        confetti.start(2500);
        break;
      case 'synergy':
        this.soundService.playSuccess();
        // this.successSound.play();
        break;
    }
  }

  private shameTimerEnded = (messageData: ShameTimerEndedMessage) => {
    const notVoted = this.session.participants
      .filter(p => !p.hasVoted)
      .map(p => ({loginId: p.loginId, name: [p.firstName, p.lastName].join(' ')}));

    this.thoseWhoHaveNotVoted = notVoted.map(v => v.loginId);
    // console.log("thoseWhoHaveNotVoted", this.thoseWhoHaveNotVoted)

    let message = 'Everyone voted in time!';
    let status = 'happy';
    let time = 2000;

    if (notVoted && notVoted.length > 0) {
      message = `Still need a vote from ${notVoted.map(m => m.name).join(', ')}`;
      status = 'warn';
      time = 10000;

      if (notVoted.find(n => this.userService.isLoginUser(n.loginId))) {
        // it was you. you didn't vote.
        this.soundService.ding();
      }
    }



    // different sound or behavior if you're in the list



    this.logs.unshift(message);
    this.showInfoBar(message, status, time, 'top');
    this.userService.stopShameTimer();
  }

  private verifyPayloadAndUpdate = (payload: any, updateFunction: any, messageData: any) => {
    if (!payload) {
      this.router.navigate(['/'], {queryParams: {error: 1}});
    } else {
      updateFunction(messageData);
      this.ballots = this.collectBallots();
    }
  }

  private updateSession = (messageData: GetStateForSessionMessage | ParticipantJoinedSessionMessage) => {
    const session = Object.assign(new StoryPointSession(), messageData.payload);
    const previousName = this.session.sessionName;
    this.session = session;
    this.session.setName(previousName); // the name gets set every. time. no.
    this.refreshParticipants(session);
  }

  private participantJoined = (messageData: ParticipantJoinedSessionMessage) => {
    const {userName, loginId} = messageData.payload;
    const itWasMe = this.userService.isLoginUser(loginId);
    const message = itWasMe ? `👋 You joined as ${userName}` : `👋 ${userName} joined.`;

    this.logs.unshift(message);
    this.showInfoBar(message, 'happy');
    this.localStorage.setUser(this.session && this.session.sessionId, this.participant);
    this.updateSession(messageData);
  }

  private participantRemoved = (messageData: ParticipantRemovedSessionMessage) => {
    const {userName, loginId} = messageData.payload;
    const itWasMe = this.userService.isLoginUser(loginId);
    const message = itWasMe ? 'You left' : `${userName} left.`;

    if (itWasMe) {
      this.clearLocalUserState();
    }

    this.logs.unshift(message);
    this.showInfoBar(message, 'warn');
    this.localStorage.removeUser(this.session && this.session.sessionId);
    this.updateSession(messageData);
  }

  private recoverUser = (user: User, participants: any[]): void => {
    if (user && participants) {
      this.participant = participants.find((p: Participant) => {

          return p && p.loginId === user.id;
        }
      );
    }
  }

  private refreshParticipants = (session: StoryPointSession) => {
    const participants = session.participants;
    this.setParticipantsInSession(participants);
  }

  private setParticipantsInSession = (participants: Participant[]) => {
    this.session.loadParticipants(participants);
    this.participantsInThisSession.next(participants);
  }

  private clearLocalUserState = () => {
    this.localStorage.removeUser(this.session && this.session.sessionId);
    this.participant = undefined;
  }

  private showInfoBar = (message: string, labelClass: string, duration: number = 2000, verticalPosition = 'bottom'): void => {
    this.snackBar.openFromComponent(AlertSnackbarComponent, {
      duration,
      horizontalPosition: 'center' as MatSnackBarHorizontalPosition,
      verticalPosition: verticalPosition as MatSnackBarVerticalPosition,
      data: {
        message,
        labelClass
      }
    });
  }
}
