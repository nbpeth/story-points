import {Injectable} from '@angular/core';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import {map, catchError, flatMap, filter} from 'rxjs/operators';
import {SpMessage} from '../active-session/model/events.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {AlertSnackbarComponent} from '../alert-snackbar/alert-snackbar.component';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private MAX_RETRIES = 5;
  private connectionRetries = this.MAX_RETRIES;
  private socket$: WebSocketSubject<any>;
  private connectionObserver$ = new BehaviorSubject<boolean>(false);
  private messages$: Observable<any>;

  constructor(private snackBar: MatSnackBar) {

  }

  connect = (targetSessionId: string | number | undefined = undefined) => {
    if (!this.socket$ || this.socket$.closed) {
      const config = {
        url: this.buildSocketUrl(targetSessionId),
        deserializer: (data) => data,
        openObserver: {
          next: () => {
            this.connectionObserver$.next(true);
            this.connectionRetries = this.MAX_RETRIES;
            console.log('WS Connected! Great job!');
          }
        },
        closeObserver: {
          next: (closeEvent) => {
            console.log('WS closed', closeEvent);
            this.connectionObserver$.next(false);
          }
        },
      };

      this.socket$ = webSocket(config);
      this.messages$ = this.socket$.asObservable();
    }
  }

  messages = (targetSessionId: string | number | undefined = undefined) => {
    return this.connectionObserver$.pipe(
      flatMap(connected => {
        if (!connected) {
          if (this.connectionRetries > 0) {
            console.log(`Attempting to connect WS. Retries remaining: ${this.connectionRetries} for target session ${targetSessionId}`);
            this.connectionRetries--;
            this.connect(targetSessionId);
          } else {
            throw new Error('Cannot connect :(');
          }
        }

        return this.messages$
          .pipe(
            catchError(e => {
              console.error('in a distant universe, something bad happened somewhere...', e);
              this.connectionObserver$.next(false);
              return of({} as MessageEvent);
            }),
            filter((_: MessageEvent) => connected),
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
    this.socket$.unsubscribe();
    this.reset();
  }

  send = (message: any): void => {
    this.socket$.next(message);
  }

  private reset() {
    this.connectionRetries = this.MAX_RETRIES;
    this.connectionObserver$ = new BehaviorSubject<boolean>(false);
  }

  private buildSocketUrl = (sessionId: string | number | undefined): string => {
    const host = document.location.host;
    const wsProtocol = document.location.protocol === 'https:' ? 'wss' : 'ws';

    let baseUrl = `${wsProtocol}://${host}/socket`;
    if (sessionId !== undefined) {
      baseUrl += `?sessionId=${sessionId}`;
    }

    return baseUrl;
  }
}
