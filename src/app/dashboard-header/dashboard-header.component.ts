import { Component, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { CreateSessionDialogComponent } from '../create-session-dialog/create-session-dialog.component';
import {UserService} from "../user.service";

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
  styleUrls: ['./dashboard-header.component.scss']
})
export class DashboardHeaderComponent {
  @Output() searchBoxValue: EventEmitter<string> = new EventEmitter<string>();
  @Output() createSession: EventEmitter<string> = new EventEmitter<string>();

  constructor(private dialog: MatDialog, private userService: UserService) { }

  create = () => {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;

    const dialogRef = this.dialog.open(CreateSessionDialogComponent, dialogConfig)

    dialogRef.afterClosed().subscribe((sessionName: string) => {
      if (sessionName) {
        this.createNewSession(sessionName);
      }
    });
  }

  searchValueChanged = (value: string) => {
    this.searchBoxValue.emit(value);
  }

  createNewSession = (withName: string) => {
    this.createSession.emit(withName);
  }

  logout(){
    this.userService.logout();
  }
}
