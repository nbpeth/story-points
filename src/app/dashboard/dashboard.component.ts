import {Component, OnInit} from '@angular/core';
import {SocketService} from '../services/socket.service';
import {Events} from '../enum/events';
import {Session} from '../session/session.component';

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
    this.socketService
      .getSocket()
      .subscribe(this.handleEvents);

    // this.socketService.send({[Events.COMPLETE_STATE]: 'undefined'});
    this.socketService.send(new GetCompleteStateMessage());
  }

  createNewSession = (name: string) => {
    // const maybeExistsAlready = this.activeSessions.find(session => session.id === name);
    //
    // if (maybeExistsAlready) {
    //   this.error = 'Session Name Already Exists';
    //   return;
    // }

    const defaultName = `Session${Math.floor(Math.random() * 100000)}`;
    const newSessionName = name ? name : defaultName;
    console.log("NAME", newSessionName, "...", name, defaultName)
    const message = new CreateNewSessionMessage(new NewSessionPayload(newSessionName));

    this.socketService.send(message);

  };

  private handleEvents = (message: MessageEvent) => {
    console.log('received::', message);

    const messageData = JSON.parse(message.data) as SpMessage;
    const eventType = messageData.eventType;
    const payload = messageData.payload;

    switch (eventType) {
      case Events.COMPLETE_STATE:
        console.log('GIMME DAT STATE!', eventType, payload);
        break;
    }


  };

  private setSessionsFrom = (data: any) => {
    // const allActiveSessions = data.sessions;
    // return this.activeSessions = Object.entries(allActiveSessions).map(this.mapActiveSessions);
  };

  private mapActiveSessions = (sessionInfo: any): Session => {
    const activeSession = new Session();
    // activeSession.id = sessionInfo[0] as string;
    // activeSession.sessionState = sessionInfo[1];

    return activeSession;
  };
}

export class SpMessage {
  eventType: string;
  payload: SpMessagePayload;

  constructor(payload?: SpMessagePayload) {
    this.payload = payload;
  };

}

export class SpMessagePayload {
}

export class NewSessionPayload extends SpMessagePayload {
  constructor(public sessionName: string) {
    super();
  }
}

export class GetCompleteStateMessage extends SpMessage {
  constructor() {
    super();
    this.eventType = Events.COMPLETE_STATE as string;
  }
}

export class CreateNewSessionMessage extends SpMessage {
  constructor(payload: SpMessagePayload) {
    super(payload);
    this.eventType = Events.SESSION_CREATED as string;
  }
}
