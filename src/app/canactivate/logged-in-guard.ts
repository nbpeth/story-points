import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {UserService} from '../user.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(private userService: UserService,
              private router: Router
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.userService.isAuthenticated()
      .pipe(
        map((isAuthenticated: boolean) => {
          if (!isAuthenticated) {
            this.userService.login();
          }
          return isAuthenticated;
        })
      );
  }
}
