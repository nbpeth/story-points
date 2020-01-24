package service

import (
	"context"
	"github.com/ReturnPath/story-points/ctxaccess"
	"github.com/ReturnPath/story-points/models"
	"github.com/gorilla/websocket"
)

func (s *Service) GetStateOfTheState(ctx context.Context) (*models.State, error) {
	state, err := s.store.GetStateOfTheState(ctx)
	if err != nil {
		return nil, err
	}

	return state, nil
}

func (s *Service) GetSessionName(ctx context.Context, req models.SpReqPayloadGetSessionName)  error {
	sessionName, err := s.store.GetSessionName(ctx, req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeGetSessionName,
		Payload: &models.SpReplyPayloadGetSessionName{
			SessionID: req.Payload.SessionID,
			SessionName: sessionName,
		},
		TargetSession: req.Payload.SessionID,
	}

	clientConn := ctxaccess.MustGetClientConn(ctx)

	return s.shareWithClients(map[*websocket.Conn]struct{}{
		clientConn: {},
	}, respMsg)
}

func (s *Service) GetSessionState(ctx context.Context, req models.SpReqPayloadSessionState) (*models.SpReplyPayloadSessionState, error) {
	participants, err := s.store.GetSessionParticipants(ctx, req.Payload.SessionID)
	if err != nil {
		return nil, err
	}

	return &models.SpReplyPayloadSessionState{
		SessionID:    req.Payload.SessionID,
		Participants: participants,
	}, nil
}

func (s *Service) CreateSession(ctx context.Context, req models.SpReqPayloadSessionCreated) error {
	_, err := s.store.CreateSession(ctx, req.Payload.SessionName)
	if err != nil {
		return err
	}

	state, err := s.store.GetStateOfTheState(ctx, )
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeStateOfTheState,
		Payload:   state,
	}

	if err := s.shareWithClients(s.clients, respMsg); err != nil {
		return err
	}

	return nil
}

func (s *Service) ParticipantJoined(ctx context.Context, req models.SpReqPayloadParticipantJoined) error {
	if err := s.store.AddParticipant(
		ctx, req.Payload.SessionID,
		req.Payload.UserName,
		0,
		req.Payload.IsAdmin,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(ctx, req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeParticipantJoined,
		Payload: models.SpReplyPayloadParticipantJoined{
			SessionID:    req.Payload.SessionID,
			UserName:     req.Payload.UserName,
			Participants: participants,
		},
		TargetSession: req.Payload.SessionID,
	}

	return s.shareWithClients(s.clients, respMsg)
}

func (s *Service) SubmitPoint(ctx context.Context, req models.SpReqPayloadPointSubmitted) error {
	if err := s.store.SubmitPoint(
		ctx, req.Payload.Value,
		req.Payload.ParticipantID,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(ctx, req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeSessionState,
		Payload: models.SpReplyPayloadPointSubmitted{
			SessionID:    req.Payload.SessionID,
			Participants: participants,
		},
		TargetSession: req.Payload.SessionID,
	}

	return s.shareWithClients(s.clients, respMsg)
}

func (s *Service) RevealPoints(ctx context.Context, req models.SpReqPayloadPointsRevealed) error {
	if err := s.store.RevealPoints(
		ctx,
		req.Payload.SessionID,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(ctx, req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeSessionState,
		Payload: models.SpReplyPayloadSessionState{
			SessionID:    req.Payload.SessionID,
			Participants: participants,
		},
		TargetSession: req.Payload.SessionID,
	}

	return s.shareWithClients(s.clients, respMsg)
}

func (s *Service) ResetPoints(ctx context.Context, req models.SpReqPayloadPointsReset) error {
	if err := s.store.ResetPoints(
		ctx,
		req.Payload.SessionID,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(ctx, req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeSessionState,
		Payload: models.SpReplyPayloadSessionState{
			SessionID:    req.Payload.SessionID,
			Participants: participants,
		},
		TargetSession: req.Payload.SessionID,
	}

	return s.shareWithClients(s.clients, respMsg)
}

func (s *Service) ParticipantRemoved(ctx context.Context, req models.SpReqPayloadParticipantRemoved) error {
	if err := s.store.RemoveParticipant(
		ctx,
		req.Payload.SessionID,
		req.Payload.ParticipantID,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(ctx, req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeParticipantRemoved,
		Payload: models.SpReplyPayloadParticipantJoined{
			SessionID:    req.Payload.SessionID,
			UserName:     req.Payload.UserName,
			Participants: participants,
		},
		TargetSession: req.Payload.SessionID,
	}

	return s.shareWithClients(s.clients, respMsg)
}

func (s *Service) TerminateSession(ctx context.Context, req models.SpReqPayloadTerminateSession) error {
	if err := s.store.TerminateSession(ctx, req.Payload.SessionID); err != nil {
		return err
	}

	state, err := s.store.GetStateOfTheState(ctx)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeStateOfTheState,
		Payload:   state,
	}

	if err := s.shareWithClients(s.clients, respMsg); err != nil {
		return err
	}

	return nil
}

func (s *Service) VotingSchemeChanged(req models.SpReqPayloadVotingSchemeChanged) error {
  respMsg := models.SpReplyMessage{
    EventType: models.EventVotingSchemeChanged,
    Payload:   struct {
      SessionID string `json:"sessionId"`
      VotingScheme string `json:"votingScheme"`
    }{
      req.Payload.SessionID,
      req.Payload.VotingScheme,
    },
  }

  if err := s.shareWithClients(s.clients, respMsg); err != nil {
    return err
  }

  return nil
}
