import {Component, Input, OnInit} from '@angular/core';
import {User, UserService} from '../user.service';
import {AuthService} from "@auth0/auth0-angular";
import {Observable} from "rxjs";

@Component({
  selector: 'app-logged-in-user',
  templateUrl: './logged-in-user.component.html',
  styleUrls: ['./logged-in-user.component.scss']
})
export class LoggedInUserComponent implements OnInit {
  @Input() enableMenu = true;
  user: User;

  constructor(public userService: UserService
  ) {
  }

  ngOnInit() {
    this.userService.userChanges().subscribe(user => {
      this.user = user;
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.userService.isAuthenticated();
  }

  logout() {
    this.userService.logout();
  }

  login() {
    this.userService.login();
  }
}
