import {Injectable} from '@angular/core';
import {AuthService, GoogleLoginProvider} from "angularx-social-login";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: User = {} as User;
  loggedIn: boolean;

  constructor(private authService: AuthService) {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
  }

  login = () => {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then(res => {
        // console.log('login', res);
      });
  }

  logout = () => {
    this.authService.signOut().then(res => {
      // console.log('logout', res);
    });
  }

  isLoggedIn = () => {
    return this.loggedIn;
  }

  getUserDisplayName = () => {
    return this.user.name;
  }
}

export interface User {
  authToken: string;
  email: string;
  firstName: string;
  id: string;
  idToken: string;
  lastName: string;
  name: string;
  photoUrl: string;
  provider: string;
}
