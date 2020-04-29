import {Component, Input} from '@angular/core';
import {SocketService} from '../../../services/socket.service';
import {TerminateSessionMessage, TerminateSessionPayload} from '../../model/events.model';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ConfirmDialogComponent} from 'src/app/confirm-dialog/confirm-dialog.component';
import {LocalStorageService} from '../../../services/local-storage.service';

@Component({
  selector: 'active-session-tile',
  templateUrl: './active-session-tile.component.html',
  styleUrls: ['./active-session-tile.component.scss']
})
export class ActiveSessionTileComponent {
  @Input() session: { id: number, sessionName: string };

  constructor(private socketService: SocketService,
              private dialog: MatDialog,
              private localStorage: LocalStorageService) {
  }

  closeSession = () => {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      id: this.session.id,
      sessionName: this.session.sessionName,
      message: `Destroy Session? This could really mess up someone's day if they're in there`
    };
    const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(this.destroySessionIfItIsWilled);
  }

  isPartnerForever() {
    return this.session.id === 29;
  }

  private destroySessionIfItIsWilled = (result: boolean) => {
    if (result) {
      const message = new TerminateSessionMessage(new TerminateSessionPayload(this.session.id));
      this.socketService.send(message);
      this.localStorage.removeSession(this.session.id);
    }
  }
}
