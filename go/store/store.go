package store

import (
	"database/sql"
	"fmt"

	"github.com/ReturnPath/story-points/models"
	_ "github.com/go-sql-driver/mysql"
)

//go:generate mockgen -destination=./mocks/store_mock.go -package=mocks github.com/ReturnPath/story-points/store Store
type Store interface {
	GetStateOfTheState() (*models.State, error)
	GetSessionName(sessionID string) (string, error)
	GetSessionParticipants(sessionID string) ([]*models.SpMessageParticipant, error)
	CreateSession(sessionName string) (int64, error)
	TerminateSession(sessionID int) error
	AddParticipant(sessionID string, name string, point int, isAdmin bool) error
	RemoveParticipant(sessionID string, participantID int) error
	SubmitPoint(value int, participantID int) error
	RevealPoints(sessionID string) error
	ResetPoints(sessionID string) error
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

func (s *store) GetStateOfTheState() (*models.State, error) {
	rows, err := s.db.Query(`
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

func (s *store) GetSessionName(sessionID string) (string, error) {
	return "BITTTZZZ", nil
}

func (s *store) GetSessionParticipants(sessionID string) ([]*models.SpMessageParticipant, error) {
	rows, err := s.db.Query(`
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

func (s *store) CreateSession(sessionName string) (int64, error) {
	result, err := s.db.Exec(`
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

func (s *store) AddParticipant(sessionID string, name string, point int, isAdmin bool) error {
	_, err := s.db.Exec(`
		INSERT INTO
		storypoints.participant
			(session_id, participant_name, point, is_admin)
		VALUES (?, ?, ?, ?)`, sessionID, name, point, isAdmin)

	return err
}

func (s *store) RemoveParticipant(sessionID string, participantID int) error {
	_, err := s.db.Exec(`
		DELETE FROM
			storypoints.participant
		WHERE id = ?
			AND session_id = ?`, participantID, sessionID)

	return err
}

func (s *store) TerminateSession(sessionID int) error {
	_, err := s.db.Exec(`
		DELETE FROM
			storypoints.sessions
		WHERE id = ?`, sessionID)

	return err
}

func (s *store) SubmitPoint(value int, participantID int) error {
	_, err := s.db.Exec(`
		UPDATE storypoints.participant
		SET point = ?,
			has_voted = true
		WHERE id = ?`, value, participantID)

	return err
}

func (s *store) RevealPoints(sessionID string) error {
	_, err := s.db.Exec(`
		UPDATE
			storypoints.sessions
		SET
			points_visible = true
		WHERE id = ?`, sessionID)

	return err
}

func (s *store) ResetPoints(sessionID string) error {
	_, err := s.db.Exec(`
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
