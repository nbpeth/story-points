import {Component, HostListener, OnInit} from '@angular/core';
import {PasswordService} from '../services/password.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {LocalStorageService} from '../services/local-storage.service';
import {flatMap, map, finalize} from 'rxjs/operators';
import {of, zip} from 'rxjs';

@Component({
  selector: 'app-session-authorization',
  templateUrl: './session-authorization.component.html',
  styleUrls: ['./session-authorization.component.scss']
})
export class SessionAuthorizationComponent implements OnInit {
  public passcode;
  public loading = false;

  errorReasons = {
    1: 'Invalid passcode'
  };

  error: string;
  sessionName: string;

  constructor(private passwordService: PasswordService,
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
      this.sessionName = queryParams.get('name') ? queryParams.get('name') : 'Session';
    });
  }

  enterPasscodeForSession() {
    this.error = undefined;
    this.loading = true;

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
      finalize(() => {
        this.loading = false;
      })
    ).subscribe(success => {
    }, err => {
      this.error = this.errorReasons[1];
    });
  }

}
