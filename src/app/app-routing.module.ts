import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActiveSessionComponent } from './active-session/active-session.component';
import { DashboardComponent } from './dashboard/dashboard.component';


const routes: Routes = [
  { path: '', component: DashboardComponent},
  { path: 'sessions/:id', component: ActiveSessionComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
