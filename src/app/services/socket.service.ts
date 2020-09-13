import {Injectable} from '@angular/core';
import {WebSocketSubjectConfig} from 'rxjs/src/internal/observable/dom/WebSocketSubject';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material';
import {map, catchError, flatMap} from 'rxjs/operators';
import {SpMessage} from '../active-session/model/events.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {AlertSnackbarComponent} from '../alert-snackbar/alert-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private MAX_RETRIES = 5;
  private socket: WebSocketSubject<any>;
  private connectionObserver = new BehaviorSubject<boolean>(false);
  private connectionRetries = this.MAX_RETRIES;

  private $messages: Observable<any>;

  constructor(private snackBar: MatSnackBar) {
  }

  connect = () => {
    if (!this.socket || this.socket.closed) {
      const host = document.location.host;
      const wsProtocol = document.location.protocol === 'https:' ? 'wss' : 'ws';

      const config = {
        url: `${wsProtocol}://${host}/socket`,
        deserializer: (data) => data,
        openObserver: {
          next: () => {
            // this.reset();
            this.connectionObserver.next(true);
            this.connectionRetries = this.MAX_RETRIES;
            console.log('WS Connected! Great job!');
          }
        },
        closeObserver: {
          next: (closeEvent) => {
            console.log('WS closed', closeEvent);
            this.connectionObserver.next(false);
          }
        },
      } as WebSocketSubjectConfig<any>;

      this.socket = webSocket(config);
      this.$messages = this.socket.asObservable();
    }
  }

  messages = () => {
    this.connect();

    return this.connectionObserver.pipe(
      flatMap(connected => {
        if (!connected) {
          if (this.connectionRetries > 0) {
            console.log('Attempting to connect WS. Retries remaining:', this.connectionRetries);
            this.connectionRetries--;
            this.connect();
          } else {
            throw new Error('Cannot connect :(');
          }
        }

        return this.$messages
          .pipe(
            // retry(1), // maybe a delay
            catchError(e => {
              console.error('in a distant universe, something bad happened somewhere...', e);
              // alert observer something bad happened and try to recover
              this.connectionObserver.next(false);
              return of({} as MessageEvent);
            }),
            map((event: MessageEvent) => {
              try {
                const messageData = JSON.parse(event.data) as SpMessage;
                if (messageData.eventType === 'error') {
                  this.showErrorBar(messageData.payload.message);
                }
                return messageData;
              } catch (e) {
                return {} as SpMessage;
              }
            })
          );
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

  close() {
    this.socket.unsubscribe();
    this.reset();
  }

  x() {
    this.socket.unsubscribe();
  }

  send = (message: any): void => {
    this.socket.next(message);
  }

  private reset() {
    this.connectionRetries = this.MAX_RETRIES;
    this.connectionObserver = new BehaviorSubject<boolean>(false);
  }
}
