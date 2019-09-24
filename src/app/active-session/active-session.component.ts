import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from '../services/socket.service';
import { Session } from '../session/session.component';
import { Events } from '../enum/events';
import { ParticipantMetaData, Participant } from '../model/models';
import { map, filter } from 'rxjs/Operators';

@Component({
  selector: 'app-active-session',
  templateUrl: './active-session.component.html',
  styleUrls: ['./active-session.component.scss']
})
export class ActiveSessionComponent implements OnInit {
  id: string;
  session: Session;
  private participants = {};
  private participant: Participant;

  constructor(private route: ActivatedRoute, private socketService: SocketService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(this.setId);
    this.socketService
      .getSocket()
      .pipe(
        map(this.handleEvents),
      )
      .subscribe();
  }

  private setId = paramMap => {
    const urlEncodedId = paramMap.get('id')
    const id = decodeURIComponent(urlEncodedId);
    this.id = id;
    this.socketService.send({ [Events.SESSION_STATE]: id });
  }

  private handleEvents = (event: MessageEvent) => {
    console.log('received', event.data)
    // const json = JSON.parse(event.data);
    // const eventKey = Object.keys(json)[0];
    // const data = Object.values(json)[0];
    // console.log('received!', event)

    // switch (eventKey) {
    //   case Events.PARTICIPANT_UPDATE:
    //     this.refreshUsersFrom(data);
    //     break;
    //   case Events.VALUE_SUBMITTED:
    //     this.participants = { ...this.participants, ...data };
    //     break;
    //   case Events.COMPLETE_STATE:

    //     console.log('COMPLETE_STATE', data)

    // }
  };

  getParticipants = () => this.participants;

  getParticipant = () => this.participant;

  submit = (value) => {
    this.socketService.send({ [Events.VALUE_SUBMITTED]: { [this.participant.name]: new ParticipantMetaData(value) } });
  };

  resetPoints = () => {
    Object.values(this.participants).forEach((participant: ParticipantMetaData) => {
      participant.point = 0;
    });

    this.socketService.send({ [Events.PARTICIPANT_UPDATE]: this.participants });
  };

  // revealPoints = () => {

  // }

  joinSession = (name: string) => {
    // if name exists, can't do it -> error

    this.addLocalParticipantBy(name);
    this.socketService.send({ [Events.PARTICIPANT_UPDATE]: this.participants });
  };

  leaveSession = () => {
    this.removeLocalParticipant();
    this.socketService.send({ [Events.PARTICIPANT_UPDATE]: this.participants });
  };

  lurker = (): boolean => !this.participant;

  private addLocalParticipantBy = (name) => {
    this.participant = new Participant(name);
    this.participants[this.participant.name] = new ParticipantMetaData();

  };

  private removeLocalParticipant = () => {
    delete this.participants[this.participant.name];
    this.participant = undefined;
  };

  private refreshUsersFrom = (participantsFromServer) => {
    this.participants = participantsFromServer;
  };
}
