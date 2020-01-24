package service

import (
  "github.com/ReturnPath/story-points/models"
)

func (s *Service) GetStateOfTheState() (*models.State, error) {
	state, err := s.store.GetStateOfTheState()
	if err != nil {
		return nil, err
	}

	return state, nil
}

func (s *Service) GetSessionName(req models.SpReqPayloadGetSessionName) (*models.SpReplyPayloadGetSessionName, error) {
	sessionName, err := s.store.GetSessionName(req.Payload.SessionID)
	if err != nil {
		return nil, err
	}

	return &models.SpReplyPayloadGetSessionName{SessionName: sessionName}, nil
}

func (s *Service) GetSessionState(req models.SpReqPayloadSessionState) (*models.SpReplyPayloadSessionState, error) {
	participants, err := s.store.GetSessionParticipants(req.Payload.SessionID)
	if err != nil {
		return nil, err
	}

	return &models.SpReplyPayloadSessionState{
		SessionID:    req.Payload.SessionID,
		Participants: participants,
	}, nil
}

func (s *Service) CreateSession(req models.SpReqPayloadSessionCreated) error {
	_, err := s.store.CreateSession(req.Payload.SessionName)
	if err != nil {
		return err
	}

	state, err := s.store.GetStateOfTheState()
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

func (s *Service) ParticipantJoined(req models.SpReqPayloadParticipantJoined) error {
	if err := s.store.AddParticipant(
		req.Payload.SessionID,
		req.Payload.UserName,
		0,
		req.Payload.IsAdmin,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(req.Payload.SessionID)
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

func (s *Service) SubmitPoint(req models.SpReqPayloadPointSubmitted) error {
	if err := s.store.SubmitPoint(
		req.Payload.Value,
		req.Payload.ParticipantID,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeSessionState,
		Payload: models.SpReplyPayloadParticipantJoined{
			SessionID:    req.Payload.SessionID,
			UserName:     req.Payload.ParticipantName,
			Participants: participants,
		},
		TargetSession: req.Payload.SessionID,
	}

	return s.shareWithClients(s.clients, respMsg)
}

func (s *Service) RevealPoints(req models.SpReqPayloadPointsRevealed) error {
	if err := s.store.RevealPoints(
		req.Payload.SessionID,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeSessionState,
		Payload: models.SpReplyPayloadParticipantJoined{
			SessionID:    req.Payload.SessionID,
			Participants: participants,
		},
		TargetSession: req.Payload.SessionID,
	}

	return s.shareWithClients(s.clients, respMsg)
}

func (s *Service) ResetPoints(req models.SpReqPayloadPointsReset) error {
	if err := s.store.ResetPoints(
		req.Payload.SessionID,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(req.Payload.SessionID)
	if err != nil {
		return err
	}

	respMsg := models.SpReplyMessage{
		EventType: models.EventTypeSessionState,
		Payload: models.SpReplyPayloadParticipantJoined{
			SessionID:    req.Payload.SessionID,
			Participants: participants,
		},
		TargetSession: req.Payload.SessionID,
	}

	return s.shareWithClients(s.clients, respMsg)
}

func (s *Service) ParticipantRemoved(req models.SpReqPayloadParticipantRemoved) error {
	if err := s.store.RemoveParticipant(
		req.Payload.SessionID,
		req.Payload.ParticipantID,
	); err != nil {
		return err
	}

	participants, err := s.store.GetSessionParticipants(req.Payload.SessionID)
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

func (s *Service) TerminateSession(req models.SpReqPayloadTerminateSession) error {
	if err := s.store.TerminateSession(req.Payload.SessionID); err != nil {
		return err
	}

	state, err := s.store.GetStateOfTheState()
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
