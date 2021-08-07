import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, ParamMap, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {UserService} from '../user.service';
import {LocalStorageService} from '../services/local-storage.service';
import {catchError, map} from 'rxjs/operators';
import {PasswordService} from '../services/password.service';

@Injectable()
export class CanActivateSession implements CanActivate {
  constructor(private userService: UserService,
              private localStorage: LocalStorageService,
              private passwordService: PasswordService,
              private router: Router
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const sessionId = route.params.id;
    const queryParams = route.queryParamMap;
    const passCode = this.getSessionPassword(queryParams, sessionId);

    return this.passwordService.authorizeSession(sessionId, passCode)
      .pipe(
        map((response: { ok: string }) => {
            return response.ok === 'yay';
          }
        ),
        catchError((err) => {
          console.error(err);
          const id = route.paramMap.get('id');
          const error = !passCode ? 0 : 1;
          this.router.navigate(['sessions', id, 'login'], { queryParams: {error} });

          return of(false);
        })
      );
  }


  private getSessionPassword = (queryParams: ParamMap, sessionId: number | string): string | undefined | null => {
    const queryPassword = queryParams.get('auth');
    if (queryPassword) {
      return queryPassword;
    }

    const sessionStoragePassword = JSON.parse(sessionStorage.getItem(`${sessionId}`) || '{}');

    return sessionStoragePassword && sessionStoragePassword.password ?
      sessionStoragePassword.password :
      this.localStorage.getCachedPasscodeForSession(sessionId);
  }
}
