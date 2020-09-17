import {Component, OnInit} from '@angular/core';
import {UserService} from "../user.service";

@Component({
  selector: 'app-logged-in-user',
  templateUrl: './logged-in-user.component.html',
  styleUrls: ['./logged-in-user.component.scss']
})
export class LoggedInUserComponent implements OnInit {
  constructor(public userService: UserService) {
  }

  ngOnInit() {
  }

  logout() {
    this.userService.logout();
  }
}
