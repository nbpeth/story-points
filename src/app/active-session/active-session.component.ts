import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SocketService} from '../services/socket.service';
import {Events} from '../enum/events';
import {Participant, ParticipantMetaData} from '../model/models';
import {map} from 'rxjs/Operators';

@Component({
  selector: 'app-active-session',
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss']
})
export class ActiveSessionComponent implements OnInit, OnDestroy {
  private participant: Participant;
  id: string;
  session: ActiveSession = {participants: {}};

  constructor(private route: ActivatedRoute, private socketService: SocketService) {
  }

  // need to persist who this person was in case of a refresh

  ngOnInit() {
    // if the session has been deleted route back to dashboard.
    this.route.paramMap.subscribe(this.setId);
    this.socketService
      .getSocket()
      .pipe(
        map(this.handleEvents),
      )
      .subscribe();
  }

  private setId = paramMap => {
    const urlEncodedId = paramMap.get('id');
    const id = decodeURIComponent(urlEncodedId);
    this.id = id;
    this.socketService.send({[Events.SESSION_STATE]: id});
  };

  private handleEvents = (event: MessageEvent) => {
    const json = JSON.parse(event.data);
    const data = Object.values(json)[0] as SessionState;

    const sessionData = data.sessions;
    this.session = sessionData[this.id];

    console.log('this sesh  ', this.session);
  };

  getParticipants = () => this.session.participants;

  getParticipant = () => this.participant;

  submit = (value) => {
    this.socketService.send({[Events.VALUE_SUBMITTED]: {[this.participant.name]: new ParticipantMetaData(value)}});
  };

  resetPoints = () => {
    // Object.values(this.participants).forEach((participant: ParticipantMetaData) => {
    //   participant.point = 0;
    // });

    // this.socketService.send({[Events.PARTICIPANT_UPDATE]: this.participants});
  };

  // revealPoints = () => {

  // }

  joinSession = (name: string) => {
    const maybeNewParticipant = new Participant(name);
    if (this.session.participants[maybeNewParticipant.name]) {
      console.log('user exists!');
      return;
    }

    this.participant = maybeNewParticipant;
    this.session.participants[this.participant.name] = new ParticipantMetaData();

    this.socketService.send({[Events.PARTICIPANT_UPDATE]: {[this.id]: this.session}});
    // if name exists, can't do it -> error
  };

  leaveSession = () => {
    const name = this.participant.name;
    delete this.session.participants[this.participant.name];
    this.participant = undefined;

    this.socketService.send({'participant-removed': {[this.id]: name}});


  };

  lurker = (): boolean => !this.participant;

  ngOnDestroy(): void {
    console.log('on destroy!!!');
    this.leaveSession();
  }

}

export interface SessionState {
  sessions: ActiveSession;
}

export interface ActiveSession {
  participants: {};
}
