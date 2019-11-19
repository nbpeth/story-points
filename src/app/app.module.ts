import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ActiveSessionTileComponent} from './active-session/active-session-tiles/active-session-tile/active-session-tile.component';
import {ActiveSessionTilesComponent} from './active-session/active-session-tiles/active-session-tiles.component';
import {ActiveSessionComponent} from './active-session/active-session.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatToolbarModule,
  MatSelectModule,
  MatInputModule,
  MatBadgeModule
} from '@angular/material';
import { UserTileComponent } from './active-session/user-tile/user-tile.component';
import { UserTilesComponent } from './active-session/user-tiles/user-tiles.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ActiveSessionTileComponent,
    ActiveSessionTilesComponent,
    ActiveSessionComponent,
    UserTileComponent,
    UserTilesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatBadgeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
