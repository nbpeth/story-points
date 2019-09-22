import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { SessionComponent } from './session/session.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ActiveSessionTileComponent } from './active-session-tiles/active-session-tile/active-session-tile.component';
import { ActiveSessionTilesComponent } from './active-session-tiles/active-session-tiles.component';

@NgModule({
  declarations: [
    AppComponent,
    // SessionComponent,
    DashboardComponent,
    ActiveSessionTileComponent,
    ActiveSessionTilesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
