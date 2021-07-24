import {Component, EventEmitter, Output} from '@angular/core';
import {CreateSessionDialogComponent, NewSession} from '../create-session-dialog/create-session-dialog.component';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

@Component({
  selector: 'app-create-session-tile',
  templateUrl: './create-session-tile.component.html',
  styleUrls: ['./create-session-tile.component.scss']
})
export class CreateSessionTileComponent  {

  @Output() createSession: EventEmitter<NewSession> = new EventEmitter<NewSession>();

  constructor(private dialog: MatDialog) { }

  create = () => {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(CreateSessionDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((sessionData: NewSession) => {
      this.createNewSession(sessionData);
    });
  }

  createNewSession = (sessionData: NewSession) => {
    this.createSession.emit(sessionData);
  }
}
