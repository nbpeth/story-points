import {Component, Inject, Input, OnInit} from '@angular/core';
import {User, UserService} from '../user.service';
import {AuthService} from "@auth0/auth0-angular";
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-logged-in-user',
  templateUrl: './logged-in-user.component.html',
  styleUrls: ['./logged-in-user.component.scss']
})
export class LoggedInUserComponent implements OnInit {
  @Input() enableMenu = true;
  user: User;

  constructor(public userService: UserService, public auth: AuthService, @Inject(DOCUMENT) private doc: Document
  ) {
  }

  ngOnInit() {
    this.userService.userChanges().subscribe(user => {
      this.user = user;
    });
  }

  logout() {
    this.auth.logout({ returnTo: this.doc.location.origin });
  }

}
