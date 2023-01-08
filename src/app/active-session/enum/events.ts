export enum Events {
  COMPLETE_STATE = 'state-of-the-state',
  PARTICIPANT_JOINED = 'participant-joined',
  PARTICIPANT_REMOVED = 'participant-removed',
  POINT_SUBMITTED = 'point-submitted',
  SESSION_CREATED = 'session-created',
  SESSION_STATE = 'session-state',
  POINTS_RESET = 'points-reset',
  POINTS_REVEALED = 'points-revealed',
  TERMINATE_SESSION = 'terminate-session',
  GET_SESSION_NAME = 'get-session-name',
  CREATE_USER = 'create-user',
  ERROR = 'error',
  CELEBRATE = 'celebrate',
  START_SHAME_TIMER = 'start-shame-timer',
  SHAME_TIMER_ENDED = 'shame-timer-ended',
  GET_POINT_SCHEMA_OPTIONS = 'get-point-schemes',
  POINT_SCHEMA_CHANGED = 'point-schema-changed',
  ACK_SHAME_TIMER_STARTED= 'ack-shame-timer-started',
}
