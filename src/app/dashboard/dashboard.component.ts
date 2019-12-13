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
import { NameBuilder } from "../name-builder";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private sessionSearchTerm = '';
  private activeSessions = {};
  visibleSessions = {};
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
    const sessions = { ...this.activeSessions }
    const matches = Object.keys(sessions).reduce((result, next) => {
      if (next.includes(this.sessionSearchTerm)) {
        result[next] = {}
      }
      return result;
    }, {});

    this.visibleSessions = matches;
  }

  private handleEvents = (message: MessageEvent) => {
    const messageData = JSON.parse(message.data) as SpMessage;
    const eventType = messageData.eventType;
    const payload = messageData.payload;

    switch (eventType) {
      case Events.COMPLETE_STATE:
        this.setSessionsFrom(payload);
        break;
      case Events.SESSION_CREATED:
        this.newSessionWasCreated(payload as NewSessionPayload);
        break;
    }
  };

  private setSessionsFrom = (payload: GetCompleteStatePayload) => {
    this.activeSessions = payload;
    this.applySearchFilter();
  };

  private newSessionWasCreated = (payload: NewSessionPayload | undefined) => {
    if (payload) {
      this.activeSessions = { ...this.activeSessions, ...payload.sessions };
    }
    this.applySearchFilter();
  };
}

