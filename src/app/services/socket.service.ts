import { Injectable } from '@angular/core';
import { WebSocketSubjectConfig } from 'rxjs/src/internal/observable/dom/WebSocketSubject';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private readonly socket: WebSocketSubject<any>;

  constructor() {
    const host = document.location.host;
    const wsProtocol = document.location.protocol === 'https:' ? 'wss' : 'ws';

    const config = {
      url: `ws://localhost:8081/socket`,
      // url: `${wsProtocol}://${host}/socket`,
      deserializer: (data) => data,
    } as WebSocketSubjectConfig<any>;

    this.socket = webSocket(config);


  }

  getSocket = () => {
    return this.socket;
  }

  send = (message: any): void => {
    this.socket.next(message);
  };
}
