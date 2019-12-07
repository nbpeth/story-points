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

  createNewSession = (name: string) => {
    // const maybeExistsAlready = this.activeSessions.find(session => session.id === name);
    //
    // if (maybeExistsAlready) {
    //   this.error = 'Session Name Already Exists';
    //   return;
    // }
    const newSessionName = name ? name : NameBuilder.generate();

    const message = new CreateNewSessionMessage(new NewSessionPayload(newSessionName));

    this.socketService.send(message);

  };

  searchBoxValueChanged = (value: string) => {
    this.sessionSearchTerm = value;
    this.applySearchFilter();
  }

  private applySearchFilter = () => {
    const sessions = { ...this.activeSessions }
    const matches = Object.keys(sessions).filter((key: string) => key.includes(this.sessionSearchTerm));
    const filtered = matches.map(matched => ({ [matched]: sessions[matched] }));

    this.visibleSessions = filtered;
    console.log(this.visibleSessions)
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
    console.log('pay', payload)
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

