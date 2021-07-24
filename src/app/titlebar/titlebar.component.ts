import {Component, EventEmitter, Output} from '@angular/core';
import {User} from '../user.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {ChangelogDialogComponent} from '../changelog-dialog/changelog-dialog.component';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent  {
  @Output() createSession: EventEmitter<string> = new EventEmitter<string>();
  user: User;
  constructor(private dialog: MatDialog) {
  }

  openChangeLog = () => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true;

      this.dialog.open(ChangelogDialogComponent, dialogConfig);
  }

}
