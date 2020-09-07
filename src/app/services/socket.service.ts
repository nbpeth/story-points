import {Injectable} from '@angular/core';
import {WebSocketSubjectConfig} from 'rxjs/src/internal/observable/dom/WebSocketSubject';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material';
import {map, retry, tap, retryWhen, delay} from 'rxjs/operators';
import {SpMessage} from '../active-session/model/events.model';
import {BehaviorSubject, of} from 'rxjs';
import {AlertSnackbarComponent} from '../alert-snackbar/alert-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: WebSocketSubject<any>;
  private connectionObserver = new BehaviorSubject<boolean>(false);

  constructor(private snackBar: MatSnackBar) {
    this.connect();
  }

  connect = () => {
    const host = document.location.host;
    const wsProtocol = document.location.protocol === 'https:' ? 'wss' : 'ws';

    const config = {
      url: `${wsProtocol}://${host}/socket`,
      deserializer: (data) => data,
      openObserver: {
        next: () => {
          console.log('WS Connected! Great job!');
          this.connectionObserver.next(true);
        }
      },
      closeObserver: {
        next: (closeEvent) => {
          console.log('WS closed', closeEvent);
          this.connectionObserver.next(false);
        }
      },
      closingObserver: {
        next: (closeEvent) => {
          console.log('Closing event about to occur', closeEvent);
          // this.connectionObserver.next(false);
        }
      }
    } as WebSocketSubjectConfig<any>;

    this.socket = webSocket(config);
  }

  // withAutoReconnect = () =>
  //   this.connectionObserver.pipe(
  //     map((connected: boolean) => {
  //         if (!connected) {
  //           console.log('connecting!');
  //           this.connect();
  //           console.log('connected?', !this.socket.closed);
  //         }
  //         return connected;
  //       }
  //     )
  //   )

  messages = () =>
    this.socket
      .pipe(
        retry(5), // maybe a delay
        // catchError(e => { handle an error? tell the client something?
        //   return of(e)
        // }),
        map((event: MessageEvent) => {
          const messageData = JSON.parse(event.data) as SpMessage;
          if (messageData.eventType === 'error') {
            this.showErrorBar(messageData.payload.message);
          }
          return messageData;
        })
      );

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

  close() {
    this.socket.unsubscribe();
  }

  send = (message: any): void => {
    this.socket.next(message);
  }
}
