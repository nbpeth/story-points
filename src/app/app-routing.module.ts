import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActiveSessionComponent } from './active-session/active-session.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {ChangeLogComponent} from './change-log/change-log.component';
import {CanActivateSession} from "./canactivate/can-activate-session";
import {SessionAuthorizationComponent} from "./session-authorization/session-authorization.component";

const routes: Routes = [
  { path: '', component: DashboardComponent},
  { path: 'changes', component: ChangeLogComponent},
  { path: 'sessions/:id', component: ActiveSessionComponent, canActivate: [CanActivateSession] },
  { path: 'sessions/:id/login', component: SessionAuthorizationComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
