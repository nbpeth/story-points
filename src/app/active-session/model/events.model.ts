/* tslint:disable:max-line-length */
import { Events } from 'src/app/active-session/enum/events';
import {User} from "../../user.service";

export class SpMessage {
  eventType: string;
  payload: SpMessagePayload;

  constructor(payload?: SpMessagePayload) {
    this.payload = payload;
  };
}

export class SpMessagePayload {
  message: string;
  sessionId: number;
  participants: any;
}

export class GetCompleteStatePayload extends SpMessagePayload {
  sessions: { id: number, sessionName: string, participantCount: number, lastActive: string, total: any, synergized: any, calculatedSynergy: any }[];
}

export class NewSessionPayload extends SpMessagePayload {
  sessions: any;

  constructor(public sessionName: string) {
    super();
  }
}

export class GetStateForSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number, participants?: any[], sessionName?: string,  pointsVisible?: boolean) {
    super();
  }
}

export class ResetPointsForSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number) {
    super();
  }
}

export class RevealPointsForSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number, public synergized: number) {
    super();
  }
}
export class TerminateSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number) {
    super();
  }
}

export class ParticipantJoinedSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number, public userName: string, public isAdmin: boolean, public loginId: string, public loginEmail: string) {
    super();
  }
}

export class ParticipantRemovedSessionPayload extends SpMessagePayload {
  constructor(public participantId: number, public userName: string, public sessionId: number, public loginId: string, public loginEmail: string) {
    super();
  }
}

export class PointSubmittedForParticipantPayload extends SpMessagePayload {
  constructor(public sessionId: number, public userId: number, public userName: string, public value: string, public hasAlreadyVoted: boolean) {
    super();
  }
}


export class GetSessionNamePayload extends SpMessagePayload {
  constructor(public sessionId: number, public schemeValues?: string, public sessionName?: string) {
    super();
  }
}

export class CreateUserPayload extends SpMessagePayload {
  constructor(public user: User) {
    super();
  }
}
export class CelebratePayload extends SpMessagePayload {
  constructor(public celebration: string, public celebrator: string = '') {
    super();
  }
}

export class StartShameTimerPayload extends SpMessagePayload {
  constructor(public sessionId: any, public userName: string) {
    super();
  }
}

export class ShameTimerEndedPayload extends SpMessagePayload {
  constructor(public sessionId: any) {
    super();
  }
}

export class PointSchemaChangedPayload extends SpMessagePayload {
  constructor(public sessionId: number, public schemaId: string) {
    super();
  }
}

export class GetCompleteStateMessage extends SpMessage {
  constructor() {
    super();
    this.eventType = Events.COMPLETE_STATE as string;
  }
}

export class CreateNewSessionMessage extends SpMessage {
  constructor(payload: SpMessagePayload) {
    super(payload);
    this.eventType = Events.SESSION_CREATED as string;
  }
}

export class GetStateForSessionMessage extends SpMessage {
  constructor(public payload: GetStateForSessionPayload) {
    super(payload);
    this.eventType = Events.SESSION_STATE as string;
  }
}

export class ParticipantJoinedSessionMessage extends SpMessage {
  constructor(public payload: ParticipantJoinedSessionPayload) {
    super(payload);
    this.eventType = Events.PARTICIPANT_JOINED as string;
  }
}

export class ParticipantRemovedSessionMessage extends SpMessage {
  constructor(public payload: ParticipantRemovedSessionPayload) {
    super(payload);
    this.eventType = Events.PARTICIPANT_REMOVED as string;
  }
}

export class PointSubmittedForParticipantMessage extends SpMessage {
  constructor(public payload: PointSubmittedForParticipantPayload) {
    super(payload);
    this.eventType = Events.POINT_SUBMITTED as string;
  }
}

export class GetSessionNameMessage extends SpMessage {
  constructor(public payload: GetSessionNamePayload) {
    super(payload);
    this.eventType = Events.GET_SESSION_NAME as string;
  }
}

export class ResetPointsForSessionMessage extends SpMessage {
  constructor(public payload: ResetPointsForSessionPayload) {
    super(payload);
    this.eventType = Events.POINTS_RESET as string;
  }
}

export class RevealPointsForSessionMessage extends SpMessage {
  constructor(public payload: RevealPointsForSessionPayload) {
    super(payload);
    this.eventType = Events.POINTS_REVEALED as string;
  }
}

export class TerminateSessionMessage extends SpMessage {
  constructor(public payload: TerminateSessionPayload) {
    super(payload);
    this.eventType = Events.TERMINATE_SESSION as string;
  }
}

export class CreateUserMessage extends SpMessage {
  constructor(public payload: CreateUserPayload) {
    super(payload);
    this.eventType = Events.CREATE_USER as string;
  }
}

export class CelebrateMessage extends SpMessage {
  constructor(public payload: CelebratePayload) {
    super(payload);
    this.eventType = Events.CELEBRATE as string;
  }
}

export class StartShameTimerMessage extends SpMessage {
  constructor(public payload: StartShameTimerPayload) {
    super(payload);
    this.eventType = Events.START_SHAME_TIMER as string;
  }
}

export class ShameTimerEndedMessage extends SpMessage {
  constructor(public payload: ShameTimerEndedPayload) {
    super(payload);
    this.eventType = Events.SHAME_TIMER_ENDED as string;
  }
}

export class GetPointSchemaOptionsMessage extends SpMessage {
  constructor(public payload: any) {
    super(payload);
    this.eventType = Events.GET_POINT_SCHEMA_OPTIONS as string;
  }
}

export class PointSchemaChangedMessage extends SpMessage {
  constructor(public payload: PointSchemaChangedPayload) {
    super(payload);
    this.eventType = Events.POINT_SCHEMA_CHANGED as string;
  }
}
