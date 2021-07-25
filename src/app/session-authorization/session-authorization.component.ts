import {Component, OnInit} from '@angular/core';
import {PasswordService} from '../services/password.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {LocalStorageService} from '../services/local-storage.service';
import {flatMap, map} from 'rxjs/operators';
import {of, zip} from 'rxjs';

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

  constructor(private passwordService: PasswordService,
              private lss: LocalStorageService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  enterPasscodeForSession() {
    this.error = undefined;

    this.route.paramMap.pipe(
      flatMap((pathParams: ParamMap) => {
        const sessionId = pathParams.get('id');
        return zip(of(sessionId), this.passwordService.authorizeSession(sessionId, this.passcode));
      }),
      map(([sessionId, res]: [string, any]) => {
        if (res.ok === 'yay') {
          this.lss.cacheSessionPasscode(+sessionId, this.passcode); // "save password?"
          this.router.navigate(['sessions', sessionId]);

          return true;
        }

        return false;
      }),
    ).subscribe(success => {
    }, err => {
      this.error = this.errorReasons[1];
    });
  }

}
