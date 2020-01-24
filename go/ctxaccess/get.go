package ctxaccess

import (
	"context"
	"github.com/gorilla/websocket"
	"log"
)

func MustGetClientConn(ctx context.Context) *websocket.Conn {
	user, ok := GetClientConn(ctx)
	if !ok {
		log.Panic("client conn not present in context")
	}

	return user
}

func GetClientConn(ctx context.Context) (*websocket.Conn, bool) {
	user, ok := ctx.Value(ctxKeyClientConn).(*websocket.Conn)
	return user, ok
}
