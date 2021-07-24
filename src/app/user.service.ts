import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {SocketService} from './services/socket.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {LocalStorageService} from './services/local-storage.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {AlertSnackbarComponent} from './alert-snackbar/alert-snackbar.component';
import {AuthService} from '@auth0/auth0-angular';
import {DOCUMENT} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: User;
  private userChanged: BehaviorSubject<User> = new BehaviorSubject<User>(this.user);
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor(public authService: AuthService,
              @Inject(DOCUMENT) private doc: Document,
              private socketService: SocketService,
              private http: HttpClient,
              private lss: LocalStorageService,
              private snackBar: MatSnackBar) {
    this.authService.user$.subscribe((user: User) => {
      this.user = user;
      this.userChanged.next(user);
      this.loggedIn.next(user != null);

      this.authService.idTokenClaims$.subscribe(x => {
        const idToken = x.__raw;
        this.lss.set('idToken', idToken);
      });
    });


    this.userChanges().subscribe((user: User) => {
      if (user) {
        this.createUser(user);
      }
    });
  }

  createUser(user: User) {
    const idToken = this.lss.get('idToken');
    this.http.post(`${environment.host}/user`, user, { headers: new HttpHeaders().append('Authorization', idToken) })
      .subscribe((res) => {
      }, error => {
        console.error(error);
        this.logoutWithPrejudice('An error occurred during login or you are not authorized to use this app');
      });
  }

  userChanges(): Observable<User> {
    return this.userChanged.asObservable();
  }

  login() {
    this.authService.loginWithRedirect();
  }

  isAuthenticated() {
    return this.authService.isAuthenticated$;
  }

  isLoading() {
    return this.authService.isLoading$;
  }

  logoutWithPrejudice(message: string) {
    this.snackBar.openFromComponent(AlertSnackbarComponent, {
      duration: 5000,
      horizontalPosition: 'center' as MatSnackBarHorizontalPosition,
      verticalPosition: 'top' as MatSnackBarVerticalPosition,
      data: {
        message,
        labelClass: 'warn',
      }
    });
    this.logout();
  }

  logout() {
    this.authService.logout({ returnTo: `${this.doc.location.origin}` });
    // this.authService.logout({ returnTo: `${this.doc.location.origin}/logout?unauthorized` });
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getLoginUser(): User {
    return this.user;
  }

  isLoginUser(loginEmail: string): boolean {
    // console.log("isLoginUser", this.user.email, loginEmail)
    return this.user && this.user.email === loginEmail; // need a better less sensitive way to identify?
  }
}

export interface User {
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: string;
  updated_at?: string;
  sub?: string;
  [key: string]: any;
}
