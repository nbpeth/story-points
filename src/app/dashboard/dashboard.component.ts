import {Component, OnInit} from '@angular/core';
import {SocketService} from '../services/socket.service';
import {Events} from '../active-session/enum/events';
import {
  GetCompleteStateMessage,
  NewSessionPayload,
  CreateNewSessionMessage,
  SpMessage,
  GetCompleteStatePayload
} from '../active-session/model/events.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  error: string;
  activeSessions = {};

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

    const message = new CreateNewSessionMessage(new NewSessionPayload(newSessionName));

    this.socketService.send(message);

  };

  private handleEvents = (message: MessageEvent) => {
    const messageData = JSON.parse(message.data) as SpMessage;
    const eventType = messageData.eventType;
    const payload = messageData.payload;

    switch (eventType) {
      case Events.COMPLETE_STATE:
        this.setSessionsFrom(payload as GetCompleteStatePayload);
        break;
      case Events.SESSION_CREATED:
        this.newSessionWasCreated(payload as NewSessionPayload);
        break;
    }
  };

  private setSessionsFrom = (payload: GetCompleteStatePayload) => {
    this.activeSessions = payload.sessions;
  };

  private newSessionWasCreated = (payload: NewSessionPayload | undefined) => {
    if (payload) {
      this.activeSessions = {...this.activeSessions, ...payload.sessions};
    }
  };
}

