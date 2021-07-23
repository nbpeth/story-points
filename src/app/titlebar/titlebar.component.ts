import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {User, UserService} from '../user.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {CreateNewSessionMessage, NewSessionPayload} from '../active-session/model/events.model';
import {SocketService} from '../services/socket.service';
import {Router} from '@angular/router';
import {ChangelogDialogComponent} from '../changelog-dialog/changelog-dialog.component';
import {AuthService} from '@auth0/auth0-angular';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent implements OnInit {
  @Output() createSession: EventEmitter<string> = new EventEmitter<string>();
  user: User;
  constructor(private dialog: MatDialog,
              public auth: AuthService,
              private userService: UserService,
              private socketService: SocketService,
              private router: Router) {
  }

  ngOnInit() {
    this.userService.userChanges().subscribe(user => {
      this.user = user;
    });
  }

  isDashboard() {
    return this.router.url === '/';
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  openChangeLog = () => {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true;

      this.dialog.open(ChangelogDialogComponent, dialogConfig);
  }

  createNewSession = (newSessionName: string) => {
    const message = new CreateNewSessionMessage(new NewSessionPayload(newSessionName));
    this.socketService.send(message);
  }

  logout() {
    this.userService.logout();
  }

  imageUrl() {
    return this.user.photoUrl;
  }
}
