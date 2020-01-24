package service

import (
  "context"
  "encoding/json"
  "fmt"

  "github.com/ReturnPath/story-points/models"
)

func (s *Service) Route(ctx context.Context, eventType models.EventType, b []byte) (interface{}, error) {
  switch eventType {
  case models.EventTypeStateOfTheState:
    return s.GetStateOfTheState(ctx)
  case models.EventTypeGetSessionName:
    var req models.SpReqPayloadGetSessionName
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.GetSessionName(ctx, req)
  case models.EventTypeSessionState:
    var req models.SpReqPayloadSessionState
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return s.GetSessionState(ctx, req)
  case models.EventTypeSessionCreated:
    var req models.SpReqPayloadSessionCreated
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.CreateSession(ctx, req)
  case models.EventTypeTerminateSession:
    var req models.SpReqPayloadTerminateSession
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.TerminateSession(ctx, req)
  case models.EventTypeParticipantJoined:
    var req models.SpReqPayloadParticipantJoined
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.ParticipantJoined(ctx, req)
  case models.EventTypeParticipantRemoved:
    var req models.SpReqPayloadParticipantRemoved
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.ParticipantRemoved(ctx, req)
  case models.EventTypePointSubmitted:
    var req models.SpReqPayloadPointSubmitted
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.SubmitPoint(ctx, req)
  case models.EventTypePointsRevealed:
    var req models.SpReqPayloadPointsRevealed
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.RevealPoints(ctx, req)
  case models.EventTypePointsReset:
    var req models.SpReqPayloadPointsReset
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.ResetPoints(ctx, req)
  case models.EventVotingSchemeChanged:
    var req models.SpReqPayloadVotingSchemeChanged
    if err := json.Unmarshal(b, &req); err != nil {
      return nil, err
    }
    return nil, s.VotingSchemeChanged(ctx, req)
  }

  return nil, fmt.Errorf("unexpected eventType: %s", eventType)
}
