package models

type EventType string

const (
	EventTypeStateOfTheState    EventType = "state-of-the-state"
	EventTypeGetSessionName               = "get-session-name"
	EventTypeSessionState                 = "session-state"
	EventTypeSessionCreated               = "session-created"
	EventTypeTerminateSession             = "terminate-session"
	EventTypeParticipantJoined            = "participant-joined"
	EventTypeParticipantRemoved           = "participant-removed"
	EventTypePointSubmitted               = "point-submitted"
	EventTypePointsRevealed               = "points-revealed"
	EventTypePointsReset                  = "points-reset"
	EventTypeError                        = "error"
)

type SpReqMessage struct {
	EventType EventType `json:"eventType"`
}

type SpReplyMessage struct {
	EventType     EventType   `json:"eventType"`
	Payload       interface{} `json:"payload"`
	TargetSession interface{} `json:"targetSession"`
}

type State struct {
	Sessions []*Session `json:"sessions"`
}

type Session struct {
	ID          int    `json:"id"`
	SessionName string `json:"sessionName"`
}

type SpReqPayloadGetSessionName struct {
	Payload struct {
		SessionID string `json:"sessionId"`
	} `json:"payload"`
}

type SpReplyPayloadGetSessionName struct {
	SessionID string `json:"sessionId"`
	SessionName string `json:"sessionName"`
}

type SpReqPayloadSessionState struct {
	Payload struct {
		SessionID string `json:"sessionId"`
	} `json:"payload"`
}

type SpReqPayloadSessionCreated struct {
	Payload struct {
		SessionName string `json:"sessionName"`
	} `json:"payload"`
}

type SpReplyPayloadSessionCreated struct {
	Payload struct {
		SessionName string `json:"sessionName"`
	} `json:"payload"`
}

type SpReqPayloadParticipantJoined struct {
	Payload struct {
		SessionID string `json:"sessionId"`
		UserName  string `json:"userName"`
		IsAdmin   bool   `json:"isAdmin"`
	} `json:"payload"`
}

type SpReplyPayloadParticipantJoined struct {
	SessionID    string                  `json:"sessionId"`
	UserName     string                  `json:"userName"`
	Participants []*SpMessageParticipant `json:"participants"`
}

type SpReplyPayloadSessionState struct {
	SessionID    string                  `json:"sessionId"`
	Participants []*SpMessageParticipant `json:"participants"`
}

type SpReqPayloadTerminateSession struct {
	Payload struct {
		SessionID int `json:"sessionId"`
	} `json:"payload"`
}

type SpReqPayloadParticipantRemoved struct {
	Payload struct {
		SessionID     string `json:"sessionId"`
		UserName      string `json:"userName"`
		ParticipantID int    `json:"participantId"`
	} `json:"payload"`
}

type SpReqPayloadPointSubmitted struct {
	Payload struct {
		SessionID       string `json:"sessionId"`
		ParticipantID   int    `json:"userId"`
		ParticipantName string `json:"userName"`
		Value           int    `json:"value"`
	} `json:"payload"`
}

type SpReplyPayloadPointSubmitted struct {
	SessionID    string                  `json:"sessionId"`
	Participants []*SpMessageParticipant `json:"participants"`
}

type SpReqPayloadPointsRevealed struct {
	Payload struct {
		SessionID string `json:"sessionId"`
	} `json:"payload"`
}

type SpReqPayloadPointsReset struct {
	Payload struct {
		SessionID string `json:"sessionId"`
	} `json:"payload"`
}

type SpMessageParticipant struct {
	SessionID     int    `json:"id"`
	SessionName   string `json:"sessionName"`
	Name          string `json:"participantName"`
	ID            int    `json:"participantId"`
	Point         int    `json:"point"`
	HasVoted      bool   `json:"hasVoted"`
	IsAdmin       bool   `json:"isAdmin"`
	PointsVisible bool   `json:"pointsVisible"`
}
