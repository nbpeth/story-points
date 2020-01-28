package store

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/ReturnPath/story-points/models"
	_ "github.com/go-sql-driver/mysql"
)

//go:generate mockgen -destination=./mocks/store_mock.go -package=mocks github.com/ReturnPath/story-points/store Store
type Store interface {
	GetStateOfTheState(ctx context.Context) (*models.State, error)
	GetSessionName(ctx context.Context, sessionID string) (string, error)
	GetSessionParticipants(ctx context.Context, sessionID string) ([]*models.SpMessageParticipant, error)
	CreateSession(ctx context.Context, sessionName string) (int64, error)
	TerminateSession(ctx context.Context, sessionID int) error
	AddParticipant(ctx context.Context, sessionID string, name string, point int, isAdmin bool) error
	RemoveParticipant(ctx context.Context, sessionID string, participantID int) error
	SubmitPoint(ctx context.Context, value string, participantID int) error
	RevealPoints(ctx context.Context, sessionID string) error
	ResetPoints(ctx context.Context, sessionID string) error
}

type store struct {
	db *sql.DB
}

type DBConf struct {
	User     string
	Name     string
	Host     string
	Password string
	Port     string
}

func New(conf DBConf) (Store, error) {
	db, err := sql.Open("mysql", buildConnStr(conf))
	if err != nil {
		return nil, err
	}

	// `Open` does not directly open connection,
	// so ensure connection established on startup
	if err := db.Ping(); err != nil {
		return nil, err
	}

	store := &store{
		db: db,
	}

	return store, nil
}

func (s *store) GetStateOfTheState(ctx context.Context) (*models.State, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT
			id,
			session_name as sessionName
		FROM storypoints.sessions`)
	if err != nil {
		return nil, err
	}

	var state models.State

	for rows.Next() {
		var session models.Session
		if err := rows.Scan(
			&session.ID,
			&session.SessionName,
		); err != nil {
			return nil, err
		}

		state.Sessions = append(state.Sessions, &session)
	}

	return &state, nil
}

func (s *store) GetSessionName(ctx context.Context, sessionID string) (string, error) {
	 row := s.db.QueryRowContext(ctx, `
		SELECT
			s.session_name as sessionName
		FROM storypoints.sessions s
		WHERE s.id = ?`, sessionID)

	var sessionName string
	 if err := row.Scan(&sessionName); err != nil {
		return "", err
	}

	return sessionName, nil
}

func (s *store) GetSessionParticipants(ctx context.Context, sessionID string) ([]*models.SpMessageParticipant, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT
			s.id, 
			s.points_visible as pointsVisible,
			s.session_name as sessionName, 
			p.participant_name as participantName, 
			p.id as participantId, 
			p.point, 
			p.is_admin as isAdmin,
			p.has_voted as hasVoted
        FROM
        	storypoints.sessions s,
        	storypoints.participant p 
        WHERE s.id = ?
        AND s.id = p.session_id;`, sessionID)
	if err != nil {
		return nil, err
	}

	participants := make([]*models.SpMessageParticipant, 0)

	for rows.Next() {
		var participant models.SpMessageParticipant
		if err := rows.Scan(
			&participant.SessionID,
			&participant.PointsVisible,
			&participant.SessionName,
			&participant.Name,
			&participant.ID,
			&participant.Point,
			&participant.IsAdmin,
			&participant.HasVoted,
		); err != nil {
			return nil, err
		}

		participants = append(participants, &participant)
	}

	return participants, nil
}

func (s *store) CreateSession(ctx context.Context, sessionName string) (int64, error) {
	result, err := s.db.ExecContext(ctx, `
		INSERT INTO
			storypoints.sessions (session_name)
		VALUES (?)`, sessionName)
	if err != nil {
		return 0, err
	}

	sessionID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return sessionID, nil
}

func (s *store) AddParticipant(ctx context.Context, sessionID string, name string, point int, isAdmin bool) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO
		storypoints.participant
			(session_id, participant_name, point, is_admin)
		VALUES (?, ?, ?, ?)`, sessionID, name, point, isAdmin)

	return err
}

func (s *store) RemoveParticipant(ctx context.Context, sessionID string, participantID int) error {
	_, err := s.db.ExecContext(ctx, `
		DELETE FROM
			storypoints.participant
		WHERE id = ?
			AND session_id = ?`, participantID, sessionID)

	return err
}

func (s *store) TerminateSession(ctx context.Context, sessionID int) error {
	_, err := s.db.ExecContext(ctx, `
		DELETE FROM
			storypoints.sessions
		WHERE id = ?`, sessionID)

	return err
}

func (s *store) SubmitPoint(ctx context.Context, value string, participantID int) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE storypoints.participant
		SET point = ?,
			has_voted = true
		WHERE id = ?`, value, participantID)

	return err
}

func (s *store) RevealPoints(ctx context.Context, sessionID string) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE
			storypoints.sessions
		SET
			points_visible = true
		WHERE id = ?`, sessionID)

	return err
}

func (s *store) ResetPoints(ctx context.Context, sessionID string) error {
	_, err := s.db.ExecContext(ctx, `
		UPDATE
			storypoints.participant p,
			storypoints.sessions s
		SET
			p.point = 0,
			p.has_voted = false,
			s.points_visible = false
		WHERE p.session_id = ?
		AND s.id = ?`, sessionID, sessionID)

	return err
}

func buildConnStr(dbConf DBConf) string {
	return fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4",
		dbConf.User,
		dbConf.Password,
		dbConf.Host,
		dbConf.Port,
		dbConf.Name,
	)
}
