import { Events } from 'src/app/active-session/enum/events';

export class SpMessage {
  eventType: string;
  payload: SpMessagePayload;

  constructor(payload?: SpMessagePayload) {
    this.payload = payload;
  };
}

export class SpMessagePayload {
  sessionId: number;
  participants: any;
}

export class GetCompleteStatePayload extends SpMessagePayload {
  sessions: { id: number, sessionName: string }[];
}

export class NewSessionPayload extends SpMessagePayload {
  sessions: any;

  constructor(public sessionName: string) {
    super();
  }
}

export class GetStateForSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number, participants?: any[], sessionName?: string, pointsVisible?: boolean) {
    super();
  }
}

export class ResetPointsForSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number) {
    super();
  }
}

export class RevealPointsForSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number) {
    super();
  }
}
export class TerminateSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number) {
    super();
  }
}

export class ParticipantJoinedSessionPayload extends SpMessagePayload {
  constructor(public sessionId: number, public userName: string, public isAdmin: boolean) {
    super();
  }
}

export class ParticipantRemovedSessionPayload extends SpMessagePayload {
  constructor(public participantId: number, public userName: string, public sessionId: number) {
    super();
  }
}

export class PointSubmittedForParticipantPayload extends SpMessagePayload {
  constructor(public sessionId: number, public userId: number, public userName: string, public value: string) {
    super();
  }
}

export class VotingSchemeChangedPayload extends SpMessagePayload {
  constructor(public sessionId: number, public votingScheme: string) {
    super();
  }
}

export class ReberoniPayload extends SpMessagePayload {
  constructor(public sessionId: number, public showReberoni: boolean) {
    super();
  }
}



export class GetSessionNamePayload extends SpMessagePayload {
  constructor(public sessionId: number, public sessionName?: string) {
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

export class VotingSchemeMessgae extends SpMessage {
  constructor(public payload: VotingSchemeChangedPayload) {
    super(payload);
    this.eventType = Events.VOTING_SCHEME as string;
  }
}

export class ReberoniMessage extends SpMessage {
  constructor(public payload: ReberoniPayload) {
    super(payload);
    this.eventType = Events.REBERONI as string;
  }
}
