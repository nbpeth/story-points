package service

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/ReturnPath/story-points/models"

	"github.com/gorilla/websocket"

	"github.com/ReturnPath/story-points/store"
)

type Service struct {
	store    store.Store
	upgrader websocket.Upgrader
	clients  map[*websocket.Conn]struct{}
}

func (s *Service) reader(conn *websocket.Conn) {
	for {
		mType, b, err := conn.ReadMessage()
		if err != nil {
			log.Printf("error reading msg: %s, type: %d", err, mType)
			if err := s.removeClient(conn); err != nil {
				log.Printf("cannot remove client: %s", err)
			}
			return
		}

		var msg models.SpReqMessage
		if err := json.Unmarshal(b, &msg); err != nil {
			log.Println("err unmarshaling to msg", err)
			return
		}

		payload, err := s.Route(msg.EventType, b)
		if err != nil {
			log.Println("error routing:", err)
			if err := conn.WriteJSON(models.SpReplyMessage{
				EventType: models.EventTypeError,
				Payload:   "yikers",
			}); err != nil {
				log.Println("error writing error to client:", err)
				return
			}
			return
		}

		// TODO: this is a hack. unhack it
		if payload != nil {
			var targetSessionID interface{}
			if v, ok := payload.(map[string]interface{}); ok {
				if sessionID, ok := v["sessionId"]; ok {
					targetSessionID = sessionID
					log.Println("yup:", targetSessionID)
				}
			}

			respMsg := models.SpReplyMessage{
				EventType:     msg.EventType,
				Payload:       payload,
				TargetSession: targetSessionID,
			}

			if err := conn.WriteJSON(respMsg); err != nil {
				log.Println("error writing json to client:", err)
				return
			}
		}
	}
}

func (s *Service) Connect(w http.ResponseWriter, r *http.Request) {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("error connecting", err)
		return
	}

	s.addClient(conn)

	conn.SetPingHandler(func(appData string) error {
		log.Println("ping received!", appData)
		return nil
	})

	conn.SetCloseHandler(func(code int, text string) error {
		log.Println(code, text)
		return nil
	})

	s.reader(conn)
}

func New(s store.Store) *Service {
	return &Service{
		store: s,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		clients: make(map[*websocket.Conn]struct{}, 0),
	}
}

func (s *Service) addClient(conn *websocket.Conn) {
	s.clients[conn] = struct{}{}
}

func (s *Service) removeClient(conn *websocket.Conn) error {
	if err := conn.Close(); err != nil {
		return err
	}

	delete(s.clients, conn)

	return nil
}

func (s *Service) shareWithClients(clients map[*websocket.Conn]struct{}, msg interface{}) error {
	b, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	for client := range clients {
		if err := client.WriteMessage(websocket.TextMessage, b); err != nil {
			return fmt.Errorf("failed writing to client: %w", err)
		}
	}

	return nil
}
