import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService} from '../services/socket.service';
import {Events} from '../active-session/enum/events';
import {
  CreateNewSessionMessage,
  GetCompleteStateMessage,
  GetCompleteStatePayload,
  NewSessionPayload,
  SpMessage
} from '../active-session/model/events.model';
import {NewSession} from "../create-session-dialog/create-session-dialog.component";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private sessionSearchTerm = '';
  private activeSessions = [];
  visibleSessions = [];
  error: string;

  constructor(private socketService: SocketService) {
  }

  ngOnInit() {
    this.socketService.messages()
      .subscribe(this.handleEvents);

    this.socketService.send(new GetCompleteStateMessage());
  }

  ngOnDestroy(): void {
    this.socketService.close();
  }

  createNewSession = (sessionData: NewSession) => {
    const message = new CreateNewSessionMessage(new NewSessionPayload(sessionData));
    this.socketService.send(message);
  }

  searchBoxValueChanged = (value: string) => {
    this.sessionSearchTerm = value;
    this.applySearchFilter();
  }

  private applySearchFilter = () => {
    const sessions = this.activeSessions ? [...this.activeSessions] : [];

    const matches = sessions.filter((session: { id: number, sessionName: string }) =>
      session.sessionName ?
        session.sessionName.toLowerCase().includes(this.sessionSearchTerm && this.sessionSearchTerm.toLowerCase()) :
        false
    );

    this.visibleSessions = matches;
  }

  private handleEvents = (messageData: SpMessage) => {
    const eventType = messageData.eventType;
    const payload = messageData.payload;
    console.log('message!', payload);

    switch (eventType) {
      case Events.COMPLETE_STATE:
        this.setSessionsFrom(payload as GetCompleteStatePayload);
        break;
      case Events.SESSION_CREATED:
        this.newSessionWasCreated(payload as NewSessionPayload);
        break;
    }
  }

  private setSessionsFrom = (payload: GetCompleteStatePayload) => {
    this.activeSessions = payload.sessions;
    this.applySearchFilter();
  }

  private newSessionWasCreated = (payload: NewSessionPayload | undefined) => {
    if (payload) {
      this.activeSessions = payload.sessions;
    }
    this.applySearchFilter();
  }
}

