import {Component, HostListener, OnInit} from '@angular/core';
import {PasswordService} from '../services/password.service';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {LocalStorageService} from '../services/local-storage.service';
import {flatMap, map, finalize, tap} from 'rxjs/operators';
import {combineLatest, of, zip} from 'rxjs';

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
      this.error = this.errorReasons[queryParams.get('error')];
    });
  }

  enterPasscodeForSession() {
    this.error = undefined;

    this.route.paramMap.pipe(
      tap((pathParams: ParamMap) => {
        const sessionId = pathParams.get('id');
        this.lss.cacheSessionPasscode(+sessionId, PasswordService.encode(this.passcode));
        this.router.navigate(['sessions', sessionId]);
      })).subscribe(success => {
    }, err => {
      this.error = this.errorReasons[1];
    });
  }

}
