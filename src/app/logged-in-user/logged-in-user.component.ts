import {Component, Input, OnInit} from '@angular/core';
import {User, UserService} from "../user.service";

@Component({
  selector: 'app-logged-in-user',
  templateUrl: './logged-in-user.component.html',
  styleUrls: ['./logged-in-user.component.scss']
})
export class LoggedInUserComponent implements OnInit {
  @Input() enableMenu = true;
  user: User;

  constructor(public userService: UserService) {
  }

  ngOnInit() {
    this.userService.userChanges().subscribe(user => {
      this.user = user;
    });
  }

  logout() {
    this.userService.logout();
  }

  signInWithGoogle(): void {
    this.userService.login();
  }
}
