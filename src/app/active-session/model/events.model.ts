import { Events } from 'src/app/active-session/enum/events';

export class SpMessage {
  eventType: string;
  payload: SpMessagePayload;
  targetSession: String;

  constructor(payload?: SpMessagePayload) {
    this.payload = payload;
  };
}

export class SpMessagePayload {
  participants: any;
}

export class GetCompleteStatePayload extends SpMessagePayload {
  sessions: any;
}

export class NewSessionPayload extends SpMessagePayload {
  sessions: any;

  constructor(public sessionName: string) {
    super();
  }
}

export class GetStateForSessionPayload extends SpMessagePayload {
  constructor(public sessionName: string) {
    super();
  }
}

export class ResetPointsForSessionPayload extends SpMessagePayload {
  constructor(public sessionName: string) {
    super();
  }
}

export class RevealPointsForSessionPayload extends SpMessagePayload {
  constructor(public sessionName: string) {
    super();
  }
}

export class ParticipantJoinedSessionPayload extends SpMessagePayload {
  constructor(public sessionName: string, public userName: string) {
    super();
  }
}

export class ParticipantRemovedSessionPayload extends SpMessagePayload {
  constructor(public sessionName: string, public userName: string) {
    super();
  }
}

export class PointSubmittedForParticipantPayload extends SpMessagePayload {
  constructor(public sessionName: string, public userName: string, public value: string) {
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

export class ResetPointsForSessionMessage extends SpMessage {
  constructor(public payload: ResetPointsForSessionPayload){
    super(payload);
    this.eventType = Events.POINTS_RESET as string;
  }
}

export class RevealPointsForSessionMessage extends SpMessage {
  constructor(public payload: RevealPointsForSessionPayload){
    super(payload);
    this.eventType = Events.POINTS_REVEALED as string;
  }
}
