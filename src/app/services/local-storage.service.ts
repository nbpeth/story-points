import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import {Participant} from '../active-session/model/session.model';
import {AppState, Globals, Session, Sessions} from './local-storage.model';


@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  key = 'appState';

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
  }

  private getState = (): AppState => {
    const appState = this.storage.get(this.key);
    if (appState) {
      return JSON.parse(appState);
    } else {
      return new AppState( new Globals(true, '50'), {} as Sessions);
    }
  };

  private setState = (state: AppState) => {
    const appState = JSON.stringify(state);
    this.storage.set(this.key, appState);
  };

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
    appState.sessions[sessionId].user = user;
    this.setState(appState);
  };
  removeUser = (sessionId: number) => {
    const appState: AppState = this.getState();
    appState.sessions[sessionId].user = {} as Participant;
    this.setState(appState);
  };

  getShowAdminConsole = (sessionId: number) => {
    const appState: AppState = this.getState();
    return appState.sessions[sessionId].settings.showAdminConsole;
  };

  setShowAdminConsole = (sessionId: number, showAdminConsole: boolean) => {
    const appState: AppState = this.getState();
    appState.sessions[sessionId].settings.showAdminConsole = showAdminConsole;
    this.setState(appState);
  };
}


