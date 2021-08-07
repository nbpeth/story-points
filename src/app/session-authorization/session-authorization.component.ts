import {Component, HostListener, OnInit} from '@angular/core';
import {PasswordService} from '../services/password.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {LocalStorageService} from '../services/local-storage.service';
import {flatMap, tap} from 'rxjs/operators';
import {SessionService} from '../services/session.service';
import {of} from 'rxjs';
import {UserService} from '../user.service';

@Component({
  selector: 'app-session-authorization',
  templateUrl: './session-authorization.component.html',
  styleUrls: ['./session-authorization.component.scss']
})
export class SessionAuthorizationComponent implements OnInit {
  passcode;
  errorReasons = {
    0: '',
    1: 'Invalid passcode'
  };
  error: string;
  sessionName: string;
  forgotPasswordClicked: boolean;
  savePassword: boolean;

  // if from dashboard do not show error, if from auth page show error
  constructor(private passwordService: PasswordService,
              private sessionService: SessionService,
              private userService: UserService,
              private lss: LocalStorageService,
              public route: ActivatedRoute,
              private router: Router) {
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.enterPasswordForSession();
    }
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((queryParams: ParamMap) => {
      this.error = this.errorReasons[queryParams.get('error')];
    });

    this.route.paramMap.pipe(
      flatMap((pathParams: ParamMap) => {
          const sessionId = pathParams.get('id');
          return this.sessionService.getSessionDetails(sessionId);
        }
      )
    ).subscribe((results: { sessionName: string, id: any }) => {
      this.sessionName = results.sessionName;
    });
  }

  forgotPassword() {
    this.forgotPasswordClicked = true;
  }

  cancelForgotPassword() {
    this.error = undefined;
    this.forgotPasswordClicked = false;
  }

  enterPasswordForSession() {
    this.route.paramMap.pipe(
      flatMap((pathParams: ParamMap) => {
        const sessionId = pathParams.get('id');
        return of(sessionId);
      }),
      tap((sessionId: any) => {
        const encodedPassword = PasswordService.encode(this.passcode);
        if (this.savePassword) {
          this.lss.cacheSessionPasscode(+sessionId, encodedPassword);
        }
        this.router.navigate(['sessions', sessionId], { queryParams: {auth: encodedPassword }});
      })).subscribe(success => {
    }, err => {
      this.error = this.errorReasons[1];
    });
  }
}
