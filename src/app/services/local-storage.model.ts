import {Participant} from '../active-session/model/session.model';

export class AppState {
  constructor(public globals: Globals, public sessions: Sessions) {
  }

  getSessionBy(id): Session | undefined {
    return this.sessions[id];
  }
}

export class Globals {
  constructor(public isDarkTheme: boolean,
              public isUltraDarkTheme: boolean,
              // public darkValue: string,
              public showAdminConsole: boolean,
              public audioEnabled: boolean,
              public showEventLog?: boolean) {
  }
}

export class Sessions {
  [sessionId: number]: Session;
}

export class Session {
  constructor(public user: Participant, public settings: SessionSettings, public auth: string) {
  }
}

export class SessionSettings {
  constructor(public showAdminConsole?: boolean, public showEventLog?: boolean) {
  }
}
