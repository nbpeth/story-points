import {Component, Input} from '@angular/core';
import {SocketService} from '../../services/socket.service';
import {ParticipantRemovedSessionMessage, ParticipantRemovedSessionPayload} from '../model/events.model';
import {Participant} from '../model/session.model';
import {UserService} from "../../user.service";

@Component({
  selector: 'user-tile',
  templateUrl: './user-tile.component.html',
  styleUrls: ['./user-tile.component.scss']
})
export class UserTileComponent {

  @Input() sessionId: any;
  @Input() participant: Participant = new Participant();
  @Input() pointsVisible: boolean;
  @Input() firstReveal: boolean;
  @Input() myCard: boolean;
  @Input() isDarkTheme: boolean;
  @Input() locked: boolean;

  constructor(private socketService: SocketService, public userService: UserService) {
  }

  removeUser = () => {
    const message = new ParticipantRemovedSessionMessage(
      new ParticipantRemovedSessionPayload(
        this.participant.participantId,
        this.participant.participantName,
        this.sessionId,

        // this.participant.loginId,
        this.participant.loginEmail
      )
    );
    this.socketService.send(message);
  }

}


