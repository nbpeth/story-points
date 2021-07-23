import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActiveSessionComponent } from './active-session/active-session.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import {ChangeLogComponent} from './change-log/change-log.component';
// import {TestComponent} from "./test/test.component";


const routes: Routes = [
  { path: '', component: DashboardComponent},
  // { path: 'changes', component: ChangeLogComponent},
  // { path: 'sessions/:id', component: ActiveSessionComponent },
  // { path: 'test', component: TestComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
