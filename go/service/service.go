package service

import (
  "context"
  "encoding/json"
  "log"
  "net/http"
  "time"

  "github.com/ReturnPath/story-points/ctxaccess"

  "github.com/ReturnPath/story-points/models"

  "github.com/gorilla/websocket"

  "github.com/ReturnPath/story-points/store"
)

type Service struct {
	store    store.Store
	upgrader websocket.Upgrader
	clients  map[*websocket.Conn]struct{}
}

func (s *Service) Read(ctx context.Context) {
	conn := ctxaccess.MustGetClientConn(ctx)

	for {
		mType, b, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsCloseError(err) {
				log.Printf("error reading msg, received close: %s, type: %v", err, mType)
			} else if websocket.IsUnexpectedCloseError(err) {
				log.Printf("error reading msg, received unexpected close: %s, type: %v", err, mType)
			} else {
				log.Printf("error reading msg: %s, type: %d", err, mType)
			}

			return
		}

		log.Println(string(b))

		var msg models.SpReqMessage
		if err := json.Unmarshal(b, &msg); err != nil {
			log.Printf("err unmarshaling to msg: %s", err)
			return
		}

		if err := s.Route(ctx, msg.EventType, b); err != nil {
			log.Println("error routing:", err)
			if err := conn.WriteJSON(models.SpReplyMessage{
				EventType: models.EventTypeError,
				Payload:   "yikers",
			}); err != nil {
				log.Printf("error writing error to client: %s", err)
				return
			}
			return
		}
	}
}

func (s *Service) Connect(w http.ResponseWriter, r *http.Request) {
	conn, err := s.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("error connecting: %s", err)
		return
	}

	s.addClient(conn)

	conn.SetCloseHandler(func(code int, text string) error {
		if err := s.removeClient(conn); err != nil {
			log.Printf("error removing client: %s", err)
		}
		log.Printf("close handler called with code: %v, text: %v", code, text)

		if err := conn.WriteControl(websocket.CloseMessage, websocket.FormatCloseMessage(code, ""), time.Now().Add(time.Second)); err != nil {
			log.Printf("could not write close message: %s", err)
		}

		return nil
	})

	ctx := ctxaccess.WithClientConn(r.Context(), conn)

	s.Read(ctx)
}

func (s *Service) Health(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte("A-OK")); err != nil {
		log.Printf("error writing health status: %s", err)
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
	if _, ok := s.clients[conn]; !ok {
		log.Println("client connection didn't exist in clients collection")
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
			if err := s.removeClient(client); err != nil {
				log.Println("could not remove client: ", err)
			}
			if err := s.removeClient(client); err != nil {
				log.Println(err)
			}

      log.Printf("failed writing to client: %w", err)
		}
	}

	return nil
}
