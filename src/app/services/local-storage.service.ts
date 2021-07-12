import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import {Participant} from '../active-session/model/session.model';
import {AppState, Globals, Session, Sessions} from './local-storage.model';
import {Subject, ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private stateEvents: Subject<any> = new ReplaySubject<any>();
  key = 'appState';

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
  }

  set = (key: string, value: string): void => {
    this.storage.set(key, value);
  }

  get = (key: string): string => this.storage.get(key);

  private getState = (): AppState => {
    const appState = this.storage.get(this.key);
    if (!appState) {
      const state = new AppState({} as Globals, {} as Sessions);
      this.storage.set(this.key, JSON.stringify(state));

      return state;
    }
    return Object.assign(new AppState(null, null), JSON.parse(appState));
  }

  private setState = (state: AppState) => {
    const appState = JSON.stringify(state);
    this.storage.set(this.key, appState);
    this.stateEvents.next(state);
  }

  stateEventStream = () =>
    this.stateEvents.asObservable()

  getTheme = (): { isDarkTheme, isUltraDarkTheme } => {
    const appState: AppState = this.getState();
    return {isDarkTheme: appState.globals.isDarkTheme, isUltraDarkTheme: appState.globals.isUltraDarkTheme};
  }

  setDarkTheme = (isDarkTheme: boolean) => {
    const appState: AppState = this.getState();
    appState.globals.isDarkTheme = isDarkTheme;
    this.setState(appState);
  }

  setUltraDarkTheme = (isUltraDarkTheme: boolean) => {
    const appState: AppState = this.getState();
    appState.globals.isUltraDarkTheme = isUltraDarkTheme;
    this.setState(appState);
  }

  removeSession = (sessionId: number) => {
    const appState: AppState = this.getState();
    delete appState.sessions[sessionId];
    this.setState(appState);
  }

  createOrGetSession = (sessionId: number) => {
    const appState: AppState = this.getState();
    if (!appState.sessions[sessionId]) {
      appState.sessions[sessionId] = {} as Session;
    }

    this.setState(appState);

    return appState.sessions[sessionId];
  }

  getUser = (sessionId: number): Participant => {
    const appState: AppState = this.getState();
    return appState.sessions[sessionId].user;
  }

  setUser = (sessionId: number, user: Participant) => {
    const appState: AppState = this.getState();
    const maybeSession = appState.getSessionBy(sessionId);
    if (maybeSession) {
      maybeSession.user = user;
    }
    this.setState(appState);
  }

  removeUser = (sessionId: number) => {
    const appState: AppState = this.getState();
    const maybeSession = appState.getSessionBy(sessionId);
    if (maybeSession) {
      maybeSession.user = {} as Participant;
      this.setState(appState);
    }
  }

  getShowAdminConsole = (sessionId: number) => {
    const appState: AppState = this.getState();
    return appState.globals.showAdminConsole;
  }

  setShowAdminConsole = (showAdminConsole: boolean) => {
    const appState: AppState = this.getState();
    const updatedState = {...appState, globals: {...appState.globals, showAdminConsole}} as AppState;

    this.setState(updatedState);
  }

  setShowEventLog = (showEventLog: boolean) => {
    const appState: AppState = this.getState();
    const updatedState = {...appState, globals: {...appState.globals, showEventLog}} as AppState;

    this.setState(updatedState);
  }

  toggleAudio = () => {
    const appState: AppState = this.getState();
    const isAudioEnabled = appState.globals.audioEnabled;
    const updatedState = {...appState, globals: {...appState.globals, audioEnabled: !isAudioEnabled}} as AppState;

    this.setState(updatedState);
  }

  cacheSessionPasscode = (sessionId: number, password: string) => {
    if (password) {
      const appState: AppState = this.getState();

      const session = this.createOrGetSession(sessionId) as Session;
      session.auth = password;

      const updatedState = {
        ...appState, sessions: {
          ...appState.sessions,
          [sessionId]: session
        }
      } as AppState;

      this.setState(updatedState);
    }
  }

  getCachedPasscodeForSession = (sesssionId: any): string | undefined | null => {
    return this.createOrGetSession(sesssionId).auth;
  }
}


