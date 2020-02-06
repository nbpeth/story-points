package service

import (
	"context"
	"github.com/ReturnPath/story-points/ctxaccess"
	"github.com/ReturnPath/story-points/models"
	"github.com/gorilla/websocket"
)

func (s *Service) GetStateOfTheState(ctx context.Context) error {
	state, err := s.store.GetStateOfTheState(ctx)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeStateOfTheState,
		Payload: state,
		TargetSession: nil,
	}

	return s.shareWithClients(map[*websocket.Conn]struct{}{
		ctxaccess.MustGetClientConn(ctx): {},
	}, respMsg)
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

	return s.shareWithClients(map[*websocket.Conn]struct{}{
		ctxaccess.MustGetClientConn(ctx): {},
	}, respMsg)
}

func (s *Service) GetSessionState(ctx context.Context, req models.SpReqPayloadSessionState) error {
	participants, err := s.store.GetSessionParticipants(ctx, req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeSessionState,
		Payload: &models.SpReplyPayloadSessionState{
			SessionID:    req.Payload.SessionID,
			Participants: participants,
		},
		TargetSession: nil,
	}

	return s.shareWithClients(map[*websocket.Conn]struct{}{
		ctxaccess.MustGetClientConn(ctx): {},
	}, respMsg)
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
		TargetSession: nil,
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
		TargetSession: nil,
	}

	if err := s.shareWithClients(s.clients, respMsg); err != nil {
		return err
	}

	return nil
}
