import {Injectable} from '@angular/core';
import {AuthService, GoogleLoginProvider} from "angularx-social-login";
import {BehaviorSubject, Observable} from "rxjs";
import {SocketService} from "./services/socket.service";
import {CreateUserMessage, CreateUserPayload} from "./active-session/model/events.model";
import {take} from "rxjs-compat/operator/take";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: User = {} as User;
  private userChanged: BehaviorSubject<User> = new BehaviorSubject<User>(this.user);
  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService, private socketService: SocketService, private http: HttpClient) {
    this.authService.authState.subscribe((user) => {
      this.user = user;
      this.userChanged.next(user);
      this.loggedIn.next(user != null);
    });

    this.userChanges().subscribe((user: User) => {
      if (user) {
        this.createUser(user)
      }
    });
  }

  createUser(user: User) {
    this.http.post("http://localhost:4200/user", user).subscribe(x => {
      // console.log("?", x);
    })
  }

  userChanges(): Observable<User> {
    return this.userChanged.asObservable();
  }

  login() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  logout() {
    this.authService.signOut();
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getUserDisplayName() {
    return this.user.name;
  }

  getLoginUser(): User {
    return this.user;
  }

  isLoginUser(loginId: string): boolean {
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
  photoUrl: string;
  provider: string;
}
