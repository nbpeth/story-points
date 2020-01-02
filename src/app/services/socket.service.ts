import { Injectable } from '@angular/core';
import { WebSocketSubjectConfig } from 'rxjs/src/internal/observable/dom/WebSocketSubject';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { map, catchError } from 'rxjs/operators';
import { SpMessage } from '../active-session/model/events.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly socket: WebSocketSubject<any>;

  constructor(private snackBar: MatSnackBar) {
    const host = document.location.host;
    const wsProtocol = document.location.protocol === 'https:' ? 'wss' : 'ws';

    const config = {
      url: `ws://localhost:8081/socket`,
      // url: `${wsProtocol}://${host}/socket`,
      deserializer: (data) => data,
      openObserver: {
        next: () => {
          console.log('WS connection ok');
        }
      },
      closeObserver: {
        next: (closeEvent) => {
          console.log('WS connection closed', closeEvent);
        }
      }
    } as WebSocketSubjectConfig<any>;

    this.socket = webSocket(config);
  }

  showErrorBar = (message: string): void => {
    const config = new MatSnackBarConfig()
    config.verticalPosition = 'top';
    config.duration = 5000;
    this.snackBar.open(message, '', config)
  }

  getSocket = () => {
    return this.socket
      .pipe(
        map((event: MessageEvent) => {
          const messageData = JSON.parse(event.data) as SpMessage;
          if (messageData.eventType === 'error') {
            this.showErrorBar(messageData.payload['message'])
          }
          return messageData;
        })
      )
  }

  send = (message: any): void => {
    this.socket.next(message);
  };

  unsubscribe = () => this.socket.unsubscribe();
}
