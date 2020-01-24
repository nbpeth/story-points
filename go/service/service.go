package service

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/ReturnPath/story-points/ctxaccess"
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

func (s *Service) reader(ctx context.Context) {
	conn := ctxaccess.MustGetClientConn(ctx)

	for {
		mType, b, err := conn.ReadMessage()
		if err != nil {
			log.Printf("error reading msg: %s, type: %d", err, mType)
			if err := s.removeClient(conn); err != nil {
				log.Printf("cannot remove client: %s", err)
			}
			return
		}
		log.Println(string(b))

		var msg models.SpReqMessage
		if err := json.Unmarshal(b, &msg); err != nil {
			log.Println("err unmarshaling to msg", err)
			return
		}

		if err := s.Route(ctx, msg.EventType, b); err != nil {
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
	}
}

func (s *Service) Connect(w http.ResponseWriter, r *http.Request) {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("error connecting", err)
		return
	}

	s.addClient(conn)

	conn.SetCloseHandler(func(code int, text string) error {
		log.Printf("close handler called with code: %v, text: %v", code, text)
		return nil
	})

	ctx := ctxaccess.WithClientConn(r.Context(), conn)

	s.reader(ctx)
}

func (s *Service) Health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte("A-OK")); err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
	}
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
