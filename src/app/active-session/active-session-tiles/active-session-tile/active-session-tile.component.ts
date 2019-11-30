import { Component, Input, SimpleChanges } from '@angular/core';
import { SocketService } from "../../../services/socket.service";
import { TerminateSessionMessage, TerminateSessionPayload } from "../../model/events.model";

@Component({
  selector: 'active-session-tile',
  templateUrl: './active-session-tile.component.html',
  styleUrls: ['./active-session-tile.component.scss']
})
export class ActiveSessionTileComponent {
  @Input() session: { [id: string]: any };
  id: string;

  constructor(private socketService: SocketService) {
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['session']) {
      this.id = Object.keys(change.session.currentValue)[0]
    }
  }

  urlEncode = (id: string) => encodeURIComponent(id);

  closeSession = (id: string) => {
    const message = new TerminateSessionMessage(new TerminateSessionPayload(id));
    this.socketService.send(message);
  }
}
