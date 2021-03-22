import {Injectable} from '@angular/core';
import {AuthService, GoogleLoginProvider, SocialUser} from 'angularx-social-login';
import {BehaviorSubject, Observable} from 'rxjs';
import {SocketService} from './services/socket.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {LocalStorageService} from './services/local-storage.service';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';
import {AlertSnackbarComponent} from './alert-snackbar/alert-snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: User;
  private userChanged: BehaviorSubject<User> = new BehaviorSubject<User>(this.user);
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoggingIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor(private authService: AuthService,
              private socketService: SocketService,
              private http: HttpClient,
              private lss: LocalStorageService,
              private snackBar: MatSnackBar) {
    this.authService.authState.subscribe((user: SocialUser) => {
      const idToken = user ? user.idToken : null;
      this.lss.set('idToken', idToken);
      this.user = user;
      this.userChanged.next(user);
      this.loggedIn.next(user != null);
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
    this.isLoggingIn.next(true);
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).finally(() => {
      this.isLoggingIn.next(false);
    });
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
    this.isLoggingIn.next(true);
    this.authService.signOut().finally(() => {
      this.isLoggingIn.next(false);
    });
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getLoginUser(): User {
    return this.user;
  }

  isLoginUser(loginId: string): boolean {
    return this.user && this.user.id === loginId;
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
