import {Injectable} from '@angular/core';
import {WebSocketSubjectConfig} from 'rxjs/src/internal/observable/dom/WebSocketSubject';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material';
import {map} from 'rxjs/operators';
import {SpMessage} from '../active-session/model/events.model';
import {AlertSnackbarComponent} from '../alert-snackbar/alert-snackbar.component';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SocketService  {
  private socket: WebSocketSubject<any>;

  constructor(private snackBar: MatSnackBar, private http: HttpClient) {
    this.connect();
  }

  connect = () => {
    const host = document.location.host.split(':')[0];
    const wsProtocol = document.location.protocol === 'https:' ? 'wss' : 'ws';

    // this.http.get(`${wsProtocol}://${host}:8080/socket`)
    console.log('!', `${wsProtocol}://${host}/socket`)
    const config = {
      url: `${wsProtocol}://${host}/socket`,
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

  messages = () => {
    return this.socket
      .pipe(
        map((event: MessageEvent) => {
          const messageData = JSON.parse(event.data) as SpMessage;
          if (messageData.eventType === 'error') {
            this.showErrorBar(messageData.payload['message']);
          }
          return messageData;
        })
      );
  }

  showErrorBar = (message: string): void => {
    this.snackBar.openFromComponent(AlertSnackbarComponent, {
      duration: 5000,
      horizontalPosition: 'center' as MatSnackBarHorizontalPosition,
      verticalPosition: 'top' as MatSnackBarVerticalPosition,
      data: {
        message,
        labelClass: 'warn',
      }
    });
  }

  send = (message: any): void => {
    this.socket.next(message);
  }

}
