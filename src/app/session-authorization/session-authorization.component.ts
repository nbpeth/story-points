import {Component, HostListener, OnInit} from '@angular/core';
import {PasswordService} from '../services/password.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {LocalStorageService} from '../services/local-storage.service';
import {flatMap, tap} from 'rxjs/operators';
import {SessionService} from '../services/session.service';
import {of} from 'rxjs';

@Component({
  selector: 'app-session-authorization',
  templateUrl: './session-authorization.component.html',
  styleUrls: ['./session-authorization.component.scss']
})
export class SessionAuthorizationComponent implements OnInit {
  public passcode;

  errorReasons = {
    1: 'Invalid passcode'
  };


  error: string;
  sessionName: string;

  constructor(private passwordService: PasswordService,
              private sessionService: SessionService,
              private lss: LocalStorageService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.enterPasscodeForSession();
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

  enterPasscodeForSession() {
    this.error = undefined;

    this.route.paramMap.pipe(
      flatMap((pathParams: ParamMap) => {
        const sessionId = pathParams.get('id');
        return of(sessionId);
      }),
      tap((sessionId: any) => {
        this.lss.cacheSessionPasscode(+sessionId, PasswordService.encode(this.passcode));
        this.router.navigate(['sessions', sessionId], {queryParams: {auth: PasswordService.encode(this.passcode)}});
      })).subscribe(success => {
    }, err => {
      this.error = this.errorReasons[1];
    });
  }
}
