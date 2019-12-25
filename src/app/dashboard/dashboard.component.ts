import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Events } from '../active-session/enum/events';
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
  private sessionSearchTerm = '';
  private activeSessions = [];
  visibleSessions = [];
  error: string;

  constructor(private socketService: SocketService) {
  }

  ngOnInit() {
    this.socketService
      .getSocket()
      .subscribe(this.handleEvents);


    this.socketService.send(new GetCompleteStateMessage());
  }


  createNewSession = (newSessionName: string) => {
    const message = new CreateNewSessionMessage(new NewSessionPayload(newSessionName));

    this.socketService.send(message);
  };

  searchBoxValueChanged = (value: string) => {
    this.sessionSearchTerm = value;
    this.applySearchFilter();
  }

  private applySearchFilter = () => {
    const sessions = this.activeSessions ? [...this.activeSessions] : []

    const matches = sessions.filter((session: { id: number, sessionName: string }) =>
      session.sessionName ? session.sessionName.includes(this.sessionSearchTerm) : false
    );

    this.visibleSessions = matches;
  }

  private handleEvents = (messageData: SpMessage) => {
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
    this.applySearchFilter();
  };

  private newSessionWasCreated = (payload: NewSessionPayload | undefined) => {
    if (payload) {
      this.activeSessions = payload.sessions;
    }
    this.applySearchFilter();
  };
}

