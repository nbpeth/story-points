import {Component, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {ThemeService} from '../services/theme.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isDarkTheme: boolean;
  
  constructor(private userService: UserService, private themeService: ThemeService) { }

  ngOnInit() {
    this.themeService.isDarkTheme.subscribe(isDarkTheme => {
      this.isDarkTheme = isDarkTheme;
    });
  }

  signInWithGoogle(): void {
    this.userService.login();
  }
}
