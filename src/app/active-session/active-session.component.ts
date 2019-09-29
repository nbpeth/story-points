import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { map, filter } from 'rxjs/Operators';
import { Events } from './enum/events';
import {
  GetStateForSessionMessage,
  GetStateForSessionPayload,
  SpMessage,
  ParticipantJoinedSessionMessage,
  ParticipantJoinedSessionPayload,
  ParticipantRemovedSessionMessage,
  ParticipantRemovedSessionPayload,
  PointSubmittedForParticipantMessage,
  PointSubmittedForParticipantPayload,
  ResetPointsForSessionPayload,
  ResetPointsForSessionMessage,
  RevealPointsForSessionMessage,
  RevealPointsForSessionPayload
} from './model/events.model';
import { StoryPointSession, Participant } from './model/session.model';
import { MatSelectChange } from '@angular/material';

@Component({
  selector: 'app-active-session',
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss']
})
export class ActiveSessionComponent implements OnInit {
  private participant: Participant;
  private selectedVote: number | string;
  availableOptions = [0, 1, 2, 3, 5, 8, 13, 21, 34, 'Abstain'];
  
  pointsAreHidden = true;
  id: string;
  session: StoryPointSession = { participants: {} };

  constructor(private route: ActivatedRoute, private router: Router, private socketService: SocketService) {
  }

  // should be able to preview your vote (inline?)

  // store state locally
  //       attempt to restore from local, if can't, then request

  // need to persist who this person was in case of a refresh


  voteHasChanged = (vote: MatSelectChange) => {
    this.selectedVote = vote.value;
  }

  ngOnInit() {
    this.route.paramMap.subscribe(this.setId);
    this.socketService
      .getSocket()
      .pipe(
        map(this.mapEvents),
        filter(this.eventsOnlyForThisSession),
        map(this.handleEvents),
      )
      .subscribe();
  }

  private setId = paramMap => {
    const urlEncodedId = paramMap.get('id');
    const id = decodeURIComponent(urlEncodedId);
    this.id = id;
    this.socketService.send(new GetStateForSessionMessage(new GetStateForSessionPayload(id)));
  };

  private mapEvents = (message: MessageEvent): SpMessage => {
    // console.log('INCOMING', message.data)
    const messageData = JSON.parse(message.data) as SpMessage;
    return messageData;
  };

  private eventsOnlyForThisSession = (message: SpMessage): boolean => {
    const targetSession = message.targetSession;

    return this.id === targetSession || message.eventType === Events.SESSION_STATE;
  };

  private handleEvents = (messageData: SpMessage) => {
    console.log('PASSED FILTER', messageData);

    const eventType = messageData.eventType;
    const payload = messageData.payload;

    switch (eventType) {
      case Events.SESSION_STATE:
        if (!payload) {
          this.router.navigate(['/'], { queryParams: { error: 1 } });
        }
        this.restoreSessionFromState(messageData as GetStateForSessionMessage);
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
        this.refreshParticipants(messageData);
        break;
      case Events.POINTS_REVEALED:
        console.log('REVEALED!');
        this.pointsAreHidden = false;
        break;
      default:
        console.log('not matched', eventType);
    }
  };

  getParticipants = () => this.session.participants;

  getParticipant = () => this.participant;

  submit = () => {
    this.socketService.send(new PointSubmittedForParticipantMessage(new PointSubmittedForParticipantPayload(this.id, this.participant.name, this.selectedVote as string)));
  };

  resetPoints = () => {
    // this.pointsAreHidden = true;
    this.socketService.send(new ResetPointsForSessionMessage(new ResetPointsForSessionPayload(this.id)));
  };

  revealPoints = () => {
    this.socketService.send(new RevealPointsForSessionMessage(new RevealPointsForSessionPayload(this.id)));
  };

  joinSession = (name: string) => {
    const maybeNewParticipant = new Participant(name, 0);
    // validate server side
    if (this.session.participants[maybeNewParticipant.name]) {
      console.log('user exists!');
      return;
    }

    this.participant = maybeNewParticipant;

    this.socketService.send(new ParticipantJoinedSessionMessage(new ParticipantJoinedSessionPayload(this.id, maybeNewParticipant.name)));

    // if name exists, can't do it -> error
  };

  leaveSession = () => {
    const name = this.participant.name;
    this.participant = undefined;
    this.socketService.send(new ParticipantRemovedSessionMessage(new ParticipantRemovedSessionPayload(this.id, name)));
  };

  lurker = (): boolean => !this.participant;

  private pointSubmittedForParticipant = (messageData: PointSubmittedForParticipantMessage) => {
    const sessionState = messageData.payload;
    console.log('session', sessionState);
    this.session = sessionState;
  };

  private restoreSessionFromState = (messageData: GetStateForSessionMessage) => {
    const sessionState = messageData.payload;
    this.session = sessionState;
  };

  private participantJoined = (messageData: ParticipantJoinedSessionMessage) => {
    this.refreshParticipants(messageData);
  };

  private participantRemoved = (messageData: ParticipantRemovedSessionMessage) => {
    this.refreshParticipants(messageData);
  };

  private refreshParticipants = (messageData: SpMessage) => {
    this.pointsAreHidden = true;
    const participants = messageData.payload['participants'];
    this.session.participants = participants;
  };
}
