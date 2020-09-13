import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {SocketService} from '../../services/socket.service';
import {ParticipantRemovedSessionMessage, ParticipantRemovedSessionPayload} from '../model/events.model';
import {Participant} from '../model/session.model';
import {UserService} from "../../user.service";

@Component({
  selector: 'user-tile',
  templateUrl: './user-tile.component.html',
  styleUrls: ['./user-tile.component.scss']
})
export class UserTileComponent
  // implements OnChanges
{
  // input hasBeenReleaved (to prevent reflipping? )

  @Input() sessionId: any;
  @Input() participant: Participant = new Participant();
  @Input() pointsVisible: boolean;
  @Input() myCard: boolean;
  @Input() isDarkTheme: boolean;

  constructor(private socketService: SocketService, private userService: UserService) {
  }

  removeUser = () => {
    const { id, email } = this.userService.getLoginUser();
    const message = new ParticipantRemovedSessionMessage(
      new ParticipantRemovedSessionPayload(
        this.participant.participantId,
        this.participant.participantName,
        this.sessionId,
        id,
        email
      )
    );
    this.socketService.send(message);
  };

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log(changes)
  // }
}


