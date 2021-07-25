import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ActiveSessionComponent} from './active-session/active-session.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {CanActivateSession} from './canactivate/can-activate-session';
import {SessionAuthorizationComponent} from './session-authorization/session-authorization.component';
import {LoggedInGuard} from './canactivate/logged-in-guard';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [LoggedInGuard]},
  { path: 'sessions/:id', component: ActiveSessionComponent, canActivate: [LoggedInGuard, CanActivateSession] },
  { path: 'sessions/:id/login', component: SessionAuthorizationComponent, canActivate: [LoggedInGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
