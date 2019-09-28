import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { Participant, ParticipantMetaData } from '../model/models';
import { map, filter } from 'rxjs/Operators';
import { Events } from './enum/events';
import { GetStateForSession, GetStateForSessionPayload, SpMessage, ParticipantJoinedSessionMessage, ParticipantJoinedSessionPayload, ParticipantRemovedSessionMessage, ParticipantRemovedSessionPayload } from './model/events.model';

@Component({
  selector: 'app-active-session',
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss']
})
export class ActiveSessionComponent implements OnInit {
  private participant: Participant;
  id: string;
  session: ActiveSession = { participants: {} };

  constructor(private route: ActivatedRoute, private router: Router, private socketService: SocketService) {
  }

  // need to persist who this person was in case of a refresh

  ngOnInit() {
    // if the session has been deleted route back to dashboard.
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
    this.socketService.send(new GetStateForSession(new GetStateForSessionPayload(id)));
  };

  private mapEvents = (message: MessageEvent): SpMessage => {
    const messageData = JSON.parse(message.data) as SpMessage;
    return messageData;
  }

  private eventsOnlyForThisSession = (message: SpMessage): boolean => {
    const targetSession = message.targetSession;

    return this.id === targetSession || message.eventType === Events.SESSION_STATE;
  }

  private handleEvents = (messageData: SpMessage) => {
    // console.log('received', message)
    const eventType = messageData.eventType;
    const payload = messageData.payload;

    switch (eventType) {
      case Events.SESSION_STATE:
        if (!payload) {
          this.router.navigate(['/'], { queryParams: { error: 1000 } });
        }
        break;
      case Events.PARTICIPANT_JOINED:
        this.participantJoined(messageData as ParticipantJoinedSessionMessage);
        break;
      case Events.PARTICIPANT_REMOVED:
        this.participantRemoved(messageData as ParticipantRemovedSessionMessage);
        break;
    }
  };

  private participantJoined = (messageData: ParticipantJoinedSessionMessage) => {
    const participants = messageData.payload['participants'];
    this.session.participants = participants;
  }

  private participantRemoved = (messageData: ParticipantRemovedSessionMessage) => {
    const participants = messageData.payload['participants'];
    this.session.participants = participants;
  }

  getParticipants = () => this.session.participants;

  getParticipant = () => this.participant;

  submit = (value) => {
    this.socketService.send({ [Events.VALUE_SUBMITTED]: { [this.participant.name]: new ParticipantMetaData(value) } });
  };

  resetPoints = () => {

  };

  revealPoints = () => {

  }

  joinSession = (name: string) => {
    const maybeNewParticipant = new Participant(name);
    // validate server side
    if (this.session.participants[maybeNewParticipant.name]) {
      console.log('user exists!');
      return;
    }

    this.participant = maybeNewParticipant;
    this.session.participants[this.participant.name] = new ParticipantMetaData();

    this.socketService.send(new ParticipantJoinedSessionMessage(new ParticipantJoinedSessionPayload(this.id, maybeNewParticipant.name)));

    // this.socketService.send({ [Events.PARTICIPANT_JOINED]: { [this.id]: this.session } });
    // if name exists, can't do it -> error
  };

  leaveSession = () => {
    const name = this.participant.name;
    this.participant = undefined;
    this.socketService.send(new ParticipantRemovedSessionMessage(new ParticipantRemovedSessionPayload(this.id, name)));
  };

  lurker = (): boolean => !this.participant;

}

export interface SessionState {
  sessions: ActiveSession;
}

export interface ActiveSession {
  participants: {};
}
