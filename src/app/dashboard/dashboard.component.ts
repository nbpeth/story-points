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
  activeSessions: Session[] = [];
  error: string;

  constructor(private socketService: SocketService) {
  }

  ngOnInit() {
    // need to ask server for state if the component was destroyed

    this.socketService
      .getSocket()
      .subscribe(this.handleEvents);
      this.socketService.send({ [Events.COMPLETE_STATE]: 'undefined' })
  }

  createNewSession = (name: string) => {
    const maybeExistsAlready = this.activeSessions.find(session => session.id === name);

    if(maybeExistsAlready) {
        this.error = 'Session Name Already Exists';
        return;
    }

    const defaultName: string = `Session${Math.floor(Math.random() * 100000)}`
    this.socketService.send({ [Events.SESSION_CREATED]: { sessionName: name ? name : defaultName } })
  }

  private handleEvents = (event) => {
    console.log('received: ', event.data)
    const json = JSON.parse(event.data);
    const eventKey = Object.keys(json)[0];
    const data = Object.values(json)[0];

    switch (eventKey) {
      case Events.SESSION_CREATED:
        this.setSessionsFrom(data);
        break;
      case Events.COMPLETE_STATE:
        console.log('** getting state')
        this.setSessionsFrom(data);
        break;
      default:
          console.log('default!', event)
    }
  }

  private setSessionsFrom = (data: any) => {
    const allActiveSessions = data.sessions;

    return this.activeSessions = Object.entries(allActiveSessions).map(this.mapActiveSessions);
  }

  private mapActiveSessions = (sessionInfo: any): Session => {
    const activeSession = new Session();
    activeSession.id = sessionInfo[0] as string;
    activeSession.sessionState = sessionInfo[1];

    return activeSession;
  }
}
