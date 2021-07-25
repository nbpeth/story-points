import {Component, OnInit} from '@angular/core';
import {PasswordService} from '../services/password.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {LocalStorageService} from '../services/local-storage.service';
import {catchError, flatMap, map} from 'rxjs/operators';
import {zip, of} from 'rxjs';

@Component({
  selector: 'app-session-authorization',
  templateUrl: './session-authorization.component.html',
  styleUrls: ['./session-authorization.component.scss']
})
export class SessionAuthorizationComponent implements OnInit {
  public passcode;

  constructor(private passwordService: PasswordService,
              private lss: LocalStorageService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  enterPasscodeForSession() {
    this.route.paramMap.pipe(
      flatMap((pathParams: ParamMap) => {
        const sessionId = pathParams.get('id');
        return zip(of(sessionId), this.passwordService.authorizeSession(sessionId, this.passcode));
      }),
      map(([sessionId, res]: [string, any]) => {
        if (res.ok === 'yay') {
          this.lss.cacheSessionPasscode(+sessionId, this.passcode);
          this.router.navigate(['sessions', sessionId]);
        }
      }),
      catchError((err => {
        // invalid password, send some message to the client
        return of();
      }))
    ).subscribe();
  }

}
