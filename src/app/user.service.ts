import {Injectable} from '@angular/core';
import {AuthService, GoogleLoginProvider} from "angularx-social-login";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: User = {} as User;
  loggedIn: boolean;

  constructor(private authService: AuthService) {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.loggedIn = (user != null);
    });
  }

  login() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);

  }

  logout() {
    this.authService.signOut();
  }

  isLoggedIn() {
    return this.loggedIn;
  }

  getUserDisplayName() {
    return this.user.name;
  }

  getLoginUser(): User {
    return this.user;
  }

  isLoginUser(loginId: string): boolean {
    console.log(this.user.id === loginId, this.user.id, loginId)
    return this.user.id === loginId;
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
  photoUrl: string; // neat!
  provider: string;
}
