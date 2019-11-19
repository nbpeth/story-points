import {Component, Input, OnInit} from '@angular/core';
import {SocketService} from '../../services/socket.service';
import {ParticipantRemovedSessionMessage, ParticipantRemovedSessionPayload} from "../model/events.model";

@Component({
  selector: 'user-tile',
  templateUrl: './user-tile.component.html',
  styleUrls: ['./user-tile.component.scss']
})
export class UserTileComponent implements OnInit {
  @Input() sessionId: any;
  @Input() participant: any;
  @Input() pointsAreHidden: boolean;
  @Input() myCard: boolean;

  constructor(private socketService: SocketService) {
  }

  ngOnInit() {
  }

  // removeUser = (participant) => {
  //   const message = new ParticipantRemovedSessionMessage(new ParticipantRemovedSessionPayload(this.sessionId, participant));
  //   this.socketService.send(message);
  // }
}
