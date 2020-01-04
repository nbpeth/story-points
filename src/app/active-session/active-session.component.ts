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
  ParticipantJoinedSessionPayload, ParticipantRemovedSessionMessage, ParticipantRemovedSessionPayload,
  PointSubmittedForParticipantMessage,
  PointSubmittedForParticipantPayload,
  ResetPointsForSessionMessage,
  ResetPointsForSessionPayload,
  RevealPointsForSessionMessage,
  RevealPointsForSessionPayload,
  SpMessage
} from './model/events.model';
import {Participant, StoryPointSession} from './model/session.model';
import {MatSelectChange} from '@angular/material';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import {ThemeService} from '../services/theme.service';
import {ParticipantFilterPipe} from '../pipe/participant-filter.pipe';
import {DefaultPointSelection} from '../point-selection/point-selection';

@Component({
  selector: 'app-active-session',
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss'],
  providers: [ParticipantFilterPipe]

})
export class ActiveSessionComponent implements OnInit, OnDestroy {
  private participant: Participant;

  isDarkTheme: boolean;
  pointSelection = new DefaultPointSelection();
  session: StoryPointSession = new StoryPointSession();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private socketService: SocketService,
              private themeService: ThemeService,
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
    this.participant.setPoint(vote.value);
  };

  resetPoints = () => {
    this.socketService.send(new ResetPointsForSessionMessage(new ResetPointsForSessionPayload(this.session.sessionId)));
  };

  revealPoints = () => {
    this.socketService.send(new RevealPointsForSessionMessage(new RevealPointsForSessionPayload(this.session.sessionId)));
  };

  joinSession = (name: string, isAdmin: boolean = false) => {
    const maybeNewParticipant = new Participant(name, undefined, 0, false, isAdmin);
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
  };

  leaveSession = () => {
    this.socketService.send(
      new ParticipantRemovedSessionMessage(
        new ParticipantRemovedSessionPayload(
          this.participant.participantId,
          this.session.sessionId
        )
      )
    );

    this.clearLocalUserState();
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
      case Events.SESSION_STATE:
      case Events.PARTICIPANT_JOINED:
      case Events.PARTICIPANT_REMOVED:
        if (!payload) {
          // real error code mappings, also not being used anywhere
          this.router.navigate(['/'], {queryParams: {error: 1}});
        } else {
          this.updateSession(messageData as GetStateForSessionMessage);
        }
        break;
      case Events.POINTS_REVEALED:
        this.session.pointsAreHidden = false;
        break;
      case Events.POINTS_RESET:
        this.session.pointsAreHidden = true;
        break;
      case Events.GET_SESSION_NAME:
        this.setSessionName(messageData as GetStateForSessionMessage)
        break;
      default:
        console.log('not matched', eventType);
    }
  };

  private updateSession = (messageData: GetStateForSessionMessage) => {
    const session = Object.assign(new StoryPointSession(), messageData.payload);
    const previousName = this.session.sessionName;
    this.session = session;
    this.session.setName(previousName);

    if (!this.participant) {
      this.recoverUser(session);
    }
    this.refreshParticipants(session);
  };

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
      return this.participant && participant.participantId === this.participant.participantId
    });

    if (!youAreStillHere) {
      this.clearLocalUserState();
    }
  }

  private clearLocalUserState = () => {
    this.storage.remove(String(this.session.sessionId));
    this.participant = undefined;
  };

}
