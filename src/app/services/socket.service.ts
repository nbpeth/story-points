import {Injectable} from '@angular/core';
import {WebSocketSubjectConfig} from 'rxjs/src/internal/observable/dom/WebSocketSubject';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: WebSocketSubject<any>;

  constructor() {
    const config = {
      url: 'ws://localhost:8999',
      deserializer: (data) => data,
    } as WebSocketSubjectConfig<any>;

    this.socket = webSocket(config);
  }

  getSocket = (): WebSocketSubject<any> => this.socket;

  send = (message) => this.socket.next(message);
}
