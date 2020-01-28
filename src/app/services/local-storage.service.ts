import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import {Participant} from '../active-session/model/session.model';
import {AppState, Globals, Session, Sessions} from './local-storage.model';
import {Subject, ReplaySubject} from 'rxjs';
import {VotingScheme} from '../voting-booth/voting.model';


@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private stateEvents: Subject<any> = new ReplaySubject<any>();
  key = 'appState';

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
  }

  private getState = (): AppState => {
    const appState = this.storage.get(this.key);
    if (!appState) {
      const state = new AppState({} as Globals, {} as Sessions);
      this.storage.set(this.key, JSON.stringify(state));

      return state;
    }
    return Object.assign(new AppState(null, null), JSON.parse(appState));
  };

  private setState = (state: AppState) => {
    const appState = JSON.stringify(state);
    this.storage.set(this.key, appState);
    this.stateEvents.next(state);
  };

  stateEventStream = () =>
    this.stateEvents.asObservable();

  getTheme = (): boolean => {
    const appState: AppState = this.getState();
    return appState.globals.isDarkTheme;
  };

  setTheme = (isDarkTheme: boolean) => {
    const appState: AppState = this.getState();
    appState.globals.isDarkTheme = isDarkTheme;
    this.setState(appState);
  };

  getDarkValue = (): number => {
    const appState: AppState = this.getState();
    return Number(appState.globals.darkValue);
  };

  setDarkValue = (darkValue: number) => {
    const appState: AppState = this.getState();
    appState.globals.darkValue = String(darkValue);
    this.setState(appState);
  };

  getSession = (sessionId: number): Session => {
    const appState: AppState = this.getState();
    return appState.sessions[sessionId];
  };

  setSession = (sessionId: number, session: Session) => {
    const appState: AppState = this.getState();
    appState.sessions[sessionId] = new Session(session.user, session.settings);
    this.setState(appState);
  };

  removeSession = (sessionId: number) => {
    const appState: AppState = this.getState();
    delete appState.sessions[sessionId];
    this.setState(appState);
  };

  getUser = (sessionId: number): Participant => {
    const appState: AppState = this.getState();
    return appState.sessions[sessionId].user;
  };

  setUser = (sessionId: number, user: Participant) => {
    const appState: AppState = this.getState();
    const maybeSession = appState.getSessionBy(sessionId);
    if (maybeSession) {
      maybeSession.user = user;
    }
    this.setState(appState);
  };

  removeUser = (sessionId: number) => {
    const appState: AppState = this.getState();
    const maybeSession = appState.getSessionBy(sessionId);
    if (maybeSession) {
      maybeSession.user = {} as Participant;
      this.setState(appState);
    }
  };

  getShowAdminConsole = (sessionId: number) => {
    const appState: AppState = this.getState();
    const maybeSession = appState.getSessionBy(sessionId);
    if (maybeSession && maybeSession.settings) {
      return maybeSession.settings.showAdminConsole;
    }

    return false;
  };

  setShowAdminConsole = (sessionId: number, showAdminConsole: boolean) => {
    const appState: AppState = this.getState();
    const maybeSession = appState.getSessionBy(sessionId);
    if (maybeSession && maybeSession.settings) {
      maybeSession.settings.showAdminConsole = showAdminConsole;
      this.setState(appState);
    }
  };

  setShowEventLog = (sessionId: number, showEventLog: boolean) => {
    const appState: AppState = this.getState();
    const maybeSession = appState.getSessionBy(sessionId);
    if (maybeSession && maybeSession.settings) {
      maybeSession.settings.showEventLog = showEventLog;
      this.setState(appState);
    }
  };

  getVotingScheme = (sessionId: number): string => {
    const appState: AppState = this.getState();
    const maybeSession = appState.getSessionBy(sessionId);
    if (maybeSession && maybeSession.settings) {
      return maybeSession.settings.votingScheme ? maybeSession.settings.votingScheme : VotingScheme.Fibbonaci;
    }
    return VotingScheme.Fibbonaci;
  };

  setVotingScheme = (sessionId: number, votingScheme: string) => {
    const appState: AppState = this.getState();
    const maybeSession = appState.getSessionBy(sessionId);
    if (maybeSession && maybeSession.settings) {
      maybeSession.settings.votingScheme = votingScheme;
      this.setState(appState);
    }
  };
}


