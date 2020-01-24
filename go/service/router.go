package service

import (
  "encoding/json"
  "fmt"
  "github.com/ReturnPath/story-points/models"
)

func (s *Service) Route(eventType models.EventType, b []byte) (interface{}, error) {
	switch eventType {
	case models.EventTypeStateOfTheState:
		return s.GetStateOfTheState()
	case models.EventTypeGetSessionName:
		var req models.SpReqPayloadGetSessionName
		if err := json.Unmarshal(b, &req); err != nil {
			return nil, err
		}
		return s.GetSessionName(req)
	case models.EventTypeSessionState:
		var req models.SpReqPayloadSessionState
		if err := json.Unmarshal(b, &req); err != nil {
			return nil, err
		}
		return s.GetSessionState(req)
	case models.EventTypeSessionCreated:
		var req models.SpReqPayloadSessionCreated
		if err := json.Unmarshal(b, &req); err != nil {
			return nil, err
		}
		return nil, s.CreateSession(req)
	case models.EventTypeTerminateSession:
		var req models.SpReqPayloadTerminateSession
		if err := json.Unmarshal(b, &req); err != nil {
			return nil, err
		}
		return nil, s.TerminateSession(req)
	case models.EventTypeParticipantJoined:
		var req models.SpReqPayloadParticipantJoined
		if err := json.Unmarshal(b, &req); err != nil {
			return nil, err
		}
		return nil, s.ParticipantJoined(req)
	case models.EventTypeParticipantRemoved:
		var req models.SpReqPayloadParticipantRemoved
		if err := json.Unmarshal(b, &req); err != nil {
			return nil, err
		}
		return nil, s.ParticipantRemoved(req)
	case models.EventTypePointSubmitted:
		var req models.SpReqPayloadPointSubmitted
		if err := json.Unmarshal(b, &req); err != nil {
			return nil, err
		}
		return nil, s.SubmitPoint(req)
	case models.EventTypePointsRevealed:
		var req models.SpReqPayloadPointsRevealed
		if err := json.Unmarshal(b, &req); err != nil {
			return nil, err
		}
		return nil, s.RevealPoints(req)
	case models.EventTypePointsReset:
		var req models.SpReqPayloadPointsReset
		if err := json.Unmarshal(b, &req); err != nil {
			return nil, err
		}
		return nil, s.ResetPoints(req)
  case models.EventVotingSchemeChanged:
    var req models.SpReqPayloadVotingSchemeChanged
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.VotingSchemeChanged(req)
	}

	return nil, fmt.Errorf("unexpected eventType: %s", eventType)
}
