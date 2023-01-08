import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CelebrateMessage, CelebratePayload, StartShameTimerMessage, StartShameTimerPayload } from '../active-session/model/events.model';
import {PointVisibilityChange} from '../control-panel/control-panel.component';
import { SocketService } from '../services/socket.service';
import { UserService } from '../user.service';

@Component({
  selector: 'admin-controls',
  templateUrl: './admin-controls.component.html',
  styleUrls: ['./admin-controls.component.scss']
})
export class AdminControlsComponent {
  @Output() pointVisibilityEvent: EventEmitter<PointVisibilityChange> = new EventEmitter<PointVisibilityChange>();
  @Input() pointsVisible: boolean;
  @Input() sessionId: any;
  isShaming: boolean;


  constructor(private socketService: SocketService, private userService: UserService) {
    this.userService.shameTimerRunning.subscribe(running => {
      this.isShaming = running;
    });
  }

  changePointVisibility = (state: PointVisibilityChange) => {
    this.pointVisibilityEvent.emit(state);
  }

  startShameTimer = () => {
    if (!this.pointsVisible) {
      const user = this.userService.getLoginUser();
      const {firstName, lastName} = user;
      this.userService.startShameTimer();
      const payload = new StartShameTimerPayload(this.sessionId, `${firstName} ${lastName}`);
      payload.sessionId = this.sessionId;
      this.socketService.send(new StartShameTimerMessage(payload));
    }
  }
}
