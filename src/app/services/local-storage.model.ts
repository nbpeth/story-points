import {Participant} from '../active-session/model/session.model';

export class AppState {
  constructor(public globals: Globals, public sessions: Sessions) {
  }
}

export class Globals {
  constructor(public isDarkTheme: boolean) {
  }
}

export class Sessions {
  [sessionId: string]: Session;
}

export class Session {
  constructor(public users: Participant[], public settings: SessionSettings) {
  }
}

export class SessionSettings {
  constructor(public showAdminConsole: boolean) {
  }
}
