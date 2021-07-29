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
          this.router.navigate(['sessions', id, 'login'], { queryParams: {...route.queryParams, error: 1} });

          return of(false);
        })
      );
  }


  private getSessionPassword = (queryParams: ParamMap, sessionId: number | string): string | undefined | null => {
    const queryPassword = queryParams.get('auth');
    if (queryPassword) {
      return queryPassword;
    }

    return this.localStorage.getCachedPasscodeForSession(sessionId);
  }
}
