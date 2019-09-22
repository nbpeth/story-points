import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { map } from 'rxjs/Operators'
import { Events } from '../enum/events';
import { Session } from '../session/session.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  activeSessions: Session[]
  error: string;

  constructor(private socketService: SocketService) {
  }

  ngOnInit() {
    this.socketService
      .getSocket()
      .subscribe(this.handleEvents);
  }

  createNewSession = (name) => {
    const maybeExistsAlready = this.activeSessions.find(session => session.id === name);

    if(maybeExistsAlready) {
        this.error = 'Session Name Already Exists';
    }

    const defaultName: string = `Session ${Math.floor(Math.random() * 100000)}`
    this.socketService.send({ [Events.SESSION_CREATED]: { sessionName: name ? name : defaultName } })
  }

  private handleEvents = (event) => {
    const json = JSON.parse(event.data);
    const eventKey = Object.keys(json)[0];
    const data = Object.values(json)[0];

    console.log('received', event)

    switch (eventKey) {
      case Events.SESSION_CREATED:
        // console.log('CReATED', data)
        this.setSessionsFrom(data);
        break;
      case Events.COMPLETE_STATE:
        // console.log('new connection', data);
        this.setSessionsFrom(data);
      default:
      // console.log('something else happened....', eventKey);
    }
  }

  private setSessionsFrom = (data) => {
    const allActiveSessions = data['state'].sessions;

    return this.activeSessions = Object.entries(allActiveSessions).map(this.mapActiveSessions);
  }

  private mapActiveSessions = (sessionInfo: any): Session => {
    const activeSession = new Session();
    activeSession.id = sessionInfo[0] as string;
    activeSession.sessionState = sessionInfo[1];

    return activeSession;
  }
}
