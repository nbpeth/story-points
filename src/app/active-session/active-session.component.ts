import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { filter, map } from 'rxjs/operators';
import { Events } from './enum/events';
import { Subscription } from 'rxjs';
import {
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
  SpMessage,
  GetSessionNamePayload,
  GetSessionNameMessage
} from './model/events.model';
import { Participant, StoryPointSession } from './model/session.model';
import { MatSelectChange } from '@angular/material';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { ThemeService } from "../services/theme.service";
import { ParticipantFilterPipe } from '../pipe/participant-filter.pipe';
import { DefaultPointSelection } from '../point-selection/point-selection';

@Component({
  selector: 'app-active-session',
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss'],
  providers: [ParticipantFilterPipe]

})
export class ActiveSessionComponent implements OnInit, OnDestroy {

  private participant: Participant;
  private selectedVote: number | string;
  isDarkTheme: boolean;
  pointSelection = new DefaultPointSelection();
  pointsAreHidden = true;

  id: number;
  name: string;
  // parts are broken out. ouch.
  session: StoryPointSession = new StoryPointSession()

  socketSubscription: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private themeService: ThemeService,
    @Inject(LOCAL_STORAGE) private storage: StorageService) {
  }

  voteHasChanged = (vote: MatSelectChange) => {
    this.selectedVote = vote.value;
  };

  ngOnInit() {
    this.route.paramMap.subscribe(this.setId);

    this.socketSubscription = this.socketService
      .getSocket()
      .pipe(
        map(this.mapEvents),
        filter(this.eventsOnlyForThisSession),
        map(this.handleEvents),
      ).subscribe();

    this.themeService.isDarkTheme.subscribe(isIt => this.isDarkTheme = isIt);
  }

  ngOnDestroy(): void {
    // breaking subs, need to unsub and create new on init
    // this.socketSubscription.unsubscribe()
  }

  getParticipant = () => this.participant;

  submit = () => {
    const vote = this.selectedVote ? this.selectedVote as string : 'Abstain';
    this.socketService.send(new PointSubmittedForParticipantMessage(new PointSubmittedForParticipantPayload(this.id, this.participant.participantId, this.participant.participantName, vote)));
  };

  resetPoints = () => {
    this.socketService.send(new ResetPointsForSessionMessage(new ResetPointsForSessionPayload(this.id)));
  };

  revealPoints = () => {
    this.socketService.send(new RevealPointsForSessionMessage(new RevealPointsForSessionPayload(this.id)));
  };

  joinSession = (name: string, admin: boolean = false) => {
    const maybeNewParticipant = new Participant(name, undefined, 0, false, admin);

    this.participant = maybeNewParticipant;
    this.storage.set(String(this.id), JSON.stringify(this.participant));

    this.socketService.send(new ParticipantJoinedSessionMessage(new ParticipantJoinedSessionPayload(this.id, maybeNewParticipant.participantName, admin)));
    // if name exists, can't do it -> error
  };

  leaveSession = () => {
    const participantId = this.participant.participantId;
    this.socketService.send(new ParticipantRemovedSessionMessage(new ParticipantRemovedSessionPayload(participantId, this.session.sessionId)));
    this.clearLocalUserState();
  };

  lurker = (): boolean => !this.participant;

  youAreTheAdmin = (): boolean => this.participant.isAdmin;

  canSeeControlPanel = (): boolean => !this.lurker() && this.youAreTheAdmin();

  isMyCard = (cardId: string) =>
    this.participant ? this.participant.participantName === cardId : false;


  private setId = (paramMap: any) => {
    const id = paramMap.get('id');
    this.id = id;

    this.recoverUser(id);
    this.socketService.send(new GetSessionNameMessage(new GetSessionNamePayload(id)));
    this.socketService.send(new GetStateForSessionMessage(new GetStateForSessionPayload(id)));
  };

  private setSessionName = (messageData: GetSessionNameMessage) => {
    this.name = messageData.payload.sessionName
  }

  private recoverUser = (id: string) => {
    const maybeRecoveredUserEntry = this.storage.get(id);
    console.log('??? recovering', id)
    if (maybeRecoveredUserEntry) {
      const maybeRecoveredUser = JSON.parse(maybeRecoveredUserEntry) as Participant;
      this.participant = new Participant(maybeRecoveredUser.participantName, maybeRecoveredUser.participantId, 0, maybeRecoveredUser.hasVoted, maybeRecoveredUser.isAdmin);
      console.log('# recovered', this.participant)
    }
  };

  private mapEvents = (message: MessageEvent): SpMessage => {
    const messageData = JSON.parse(message.data) as SpMessage;
    return messageData;
  };

  private eventsOnlyForThisSession = (message: SpMessage): boolean => {
    const targetSession = message.targetSession;

    return this.id == targetSession || message.eventType === Events.SESSION_STATE;
  };

  private restoreSessionFromState = (messageData: GetStateForSessionMessage) => {
    const session = messageData.payload;
    this.session = session as StoryPointSession;
    this.setIdForLocalUser(session.participants);
    this.refreshParticipants(messageData)
  };

  private setIdForLocalUser = (participants: any[]) => {
    participants.forEach((p: { participantName: string, participantId: number }) => {

      if (this.participant && p.participantName === this.participant.participantName) {
        this.participant.participantId = p.participantId
      }
    })
  }

  private handleEvents = (messageData: SpMessage) => {
    const eventType = messageData.eventType;
    const payload = messageData.payload;

    // console.log('messageData', messageData)
    switch (eventType) {
      case Events.SESSION_STATE:
        if (!payload) {
          this.router.navigate(['/'], { queryParams: { error: 1 } });
        } else {
          this.restoreSessionFromState(messageData as GetStateForSessionMessage);
        }
        break;
      case Events.PARTICIPANT_JOINED:
        this.participantJoined(messageData as ParticipantJoinedSessionMessage);
        break;
      case Events.PARTICIPANT_REMOVED:
        this.participantRemoved(messageData as ParticipantRemovedSessionMessage);
        break;
      case Events.POINT_SUBMITTED:
        this.pointSubmittedForParticipant(messageData as PointSubmittedForParticipantMessage);
        break;
      case Events.POINTS_RESET:
        this.pointsAreHidden = true;
        this.refreshParticipants(messageData);
        break;
      case Events.POINTS_REVEALED:
        this.pointsAreHidden = false;
        break;
      case Events.GET_SESSION_NAME:
        this.setSessionName(messageData as GetStateForSessionMessage)
        break;
      default:
        console.log('not matched', eventType);
    }
  };

  private clearLocalUserState = () => {
    this.participant = undefined;
    this.storage.remove(String(this.id));
  };

  private pointSubmittedForParticipant = (messageData: PointSubmittedForParticipantMessage) => {
    const sessionState = messageData.payload;
    // this.session = sessionState;
  };


  private participantJoined = (messageData: ParticipantJoinedSessionMessage) => {
    this.refreshParticipants(messageData);
  };

  private participantRemoved = (messageData: ParticipantRemovedSessionMessage) => {
    this.refreshParticipants(messageData);
  };

  private refreshParticipants = (messageData: SpMessage) => {
    const participants = messageData.payload.participants;
    this.setIdForLocalUser(participants);
    this.session.participants = participants;

    this.ensureYouAreStillActive();
  };

  // out of order, clearing every time you change a route
  private ensureYouAreStillActive = () => {
    const youAreStillHere = this.session.participants.find((participant: Participant) =>
      this.participant && participant.participantId == this.participant.participantId
    )

    console.log('youAreStillHere', this.session.participants, this.participant)

    if (!youAreStillHere) {
      this.clearLocalUserState();
    }
  }
}
