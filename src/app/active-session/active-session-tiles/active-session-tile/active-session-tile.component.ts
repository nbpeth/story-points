import {Component, Input} from '@angular/core';
import {SocketService} from '../../../services/socket.service';
import {TerminateSessionMessage, TerminateSessionPayload} from '../../model/events.model';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmDialogComponent} from 'src/app/confirm-dialog/confirm-dialog.component';
import {LocalStorageService} from '../../../services/local-storage.service';
import {UserService} from '../../../user.service';

@Component({
  selector: 'active-session-tile',
  templateUrl: './active-session-tile.component.html',
  styleUrls: ['./active-session-tile.component.scss']
})
export class ActiveSessionTileComponent {
  @Input() session: { id: number, sessionName: string, participantCount: number, lastActive: any };

  constructor(private socketService: SocketService,
              private dialog: MatDialog,
              private localStorage: LocalStorageService,
              public userService: UserService) {
  }

  closeSession = () => {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: this.session.id,
      sessionName: this.session.sessionName,
      message: 'Destroy Session - Be You Certain?'
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(this.destroySessionIfItIsWilled);
  }

  private destroySessionIfItIsWilled = (result: boolean) => {
    if (result) {
      const message = new TerminateSessionMessage(new TerminateSessionPayload(this.session.id));
      this.socketService.send(message);
      this.localStorage.removeSession(this.session.id);
    }
  }
}
