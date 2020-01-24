package ctxaccess

import (
	"context"
	"github.com/gorilla/websocket"
)

func WithClientConn(ctx context.Context, conn *websocket.Conn) context.Context {
	return context.WithValue(ctx, ctxKeyClientConn, conn)
}
