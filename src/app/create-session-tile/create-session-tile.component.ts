import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CreateSessionDialogComponent} from '../create-session-dialog/create-session-dialog.component';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';

@Component({
  selector: 'app-create-session-tile',
  templateUrl: './create-session-tile.component.html',
  styleUrls: ['./create-session-tile.component.scss']
})
export class CreateSessionTileComponent implements OnInit {

  @Output() createSession: EventEmitter<string> = new EventEmitter<string>();

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
  }

  create = () => {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(CreateSessionDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((sessionName: string) => {
      if (sessionName) {
        this.createNewSession(sessionName);
      }
    });
  }

  createNewSession = (withName: string) => {
    this.createSession.emit(withName);
  }
}
