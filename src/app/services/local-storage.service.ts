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
    const appState = new AppState(new Globals(false), {});
    this.setState(appState);
  }

  private getState = (): AppState => {
    const appState = this.storage.get(this.key);
    return JSON.parse(appState);
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

  getSession = (sessionId: string): Session => {
    const appState: AppState = this.getState();
    return appState.sessions[sessionId];
  };

  setSession = (sessionId: string, session: Session) => {
    const appState: AppState = this.getState();
    appState.sessions[sessionId] = new Session(session.users, session.settings);
    this.setState(appState);
  };

  removeSession = (sessionId: string) => {
    const appState: AppState = this.getState();
    delete appState.sessions[sessionId];
    this.setState(appState);
  };

  updateUsers = (sessionId: string, users: Participant[]) => {
    const appState: AppState = this.getState();
    appState.sessions[sessionId].users = users;
    this.setState(appState);
  };

  getShowAdminConsole = (sessionId: string) => {
    const appState: AppState = this.getState();
    return appState.sessions[sessionId].settings.showAdminConsole;
  };

  setShowAdminConsole = (sessionId: string, showAdminConsole: boolean) => {
    const appState: AppState = this.getState();
    appState.sessions[sessionId].settings.showAdminConsole = showAdminConsole;
    this.setState(appState);
  };
}


