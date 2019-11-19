import {Component, Input} from '@angular/core';
import {SocketService} from "../../../services/socket.service";
import {TerminateSessionMessage, TerminateSessionPayload} from "../../model/events.model";

@Component({
  selector: 'active-session-tile',
  templateUrl: './active-session-tile.component.html',
  styleUrls: ['./active-session-tile.component.scss']
})
export class ActiveSessionTileComponent {
  @Input() id: string;

  constructor(private socketService: SocketService) {
  }

  urlEncode = (id: string) => encodeURIComponent(id);

  closeSession = (id: string) => {
    const message = new TerminateSessionMessage(new TerminateSessionPayload(id));
    this.socketService.send(message);
  }
}
