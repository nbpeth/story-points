import {BrowserModule, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ActiveSessionTileComponent} from './active-session/active-session-tiles/active-session-tile/active-session-tile.component';
import {ActiveSessionTilesComponent} from './active-session/active-session-tiles/active-session-tiles.component';
import {ActiveSessionComponent} from './active-session/active-session.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  GestureConfig,
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatIconModule,
  MatInputModule,
  MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatToolbarModule
} from '@angular/material';
import {UserTileComponent} from './active-session/user-tile/user-tile.component';
import {UserTilesComponent} from './active-session/user-tiles/user-tiles.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {TitlebarComponent} from './titlebar/titlebar.component';
import {ThemeToggleComponent} from './theme-toggle/theme-toggle.component';
import {DashboardHeaderComponent} from './dashboard-header/dashboard-header.component';
import {SearchBoxComponent} from './search-box/search-box.component';
import {ConfirmDialogComponent} from './confirm-dialog/confirm-dialog.component';
import {OverlayContainer} from '@angular/cdk/overlay';
import {ThemeService} from './services/theme.service';
import {CreateSessionDialogComponent} from './create-session-dialog/create-session-dialog.component';
import {ParticipantFilterPipe} from './pipe/participant-filter.pipe';
import {AlertSnackbarComponent} from './alert-snackbar/alert-snackbar.component';
import {ControlPanelComponent} from './control-panel/control-panel.component';
import {JoinSessionDialogComponent} from './join-session-dialog/join-session-dialog.component';
import {FormsModule} from '@angular/forms';
import {AdminControlsComponent} from './admin-controls/admin-controls.component';
import {VotingBoothComponent} from './voting-booth/voting-booth.component';
import {BallotDisplayComponent} from './vote-display/ballot-display.component';
import {ActivityLogComponent} from './activity-log/activity-log.component';
import {AuthServiceConfig, GoogleLoginProvider, SocialLoginModule} from 'angularx-social-login';
import {MatMenuModule} from "@angular/material/menu";
//
// const config =
//
//   new AuthServiceConfig([
//   {
//     id: GoogleLoginProvider.PROVIDER_ID,
//     provider: new GoogleLoginProvider('169440150514-6p8qrgf59kceaonb8qvpk10jam8gmaho.apps.googleusercontent.com')
//   },
// ])

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ActiveSessionTileComponent,
    ActiveSessionTilesComponent,
    ActiveSessionComponent,
    UserTileComponent,
    UserTilesComponent,
    TitlebarComponent,
    ThemeToggleComponent,
    DashboardHeaderComponent,
    SearchBoxComponent,
    ConfirmDialogComponent,
    CreateSessionDialogComponent,
    ParticipantFilterPipe,
    AlertSnackbarComponent,
    ControlPanelComponent,
    JoinSessionDialogComponent,
    AdminControlsComponent,
    VotingBoothComponent,
    BallotDisplayComponent,
    ActivityLogComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    FormsModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatInputModule,
    MatBadgeModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatSliderModule,
    SocialLoginModule
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmDialogComponent, JoinSessionDialogComponent, CreateSessionDialogComponent, AlertSnackbarComponent]

})

export class AppModule {
  constructor(private overlayContainer: OverlayContainer, private themeService: ThemeService) {

    this.themeService.isDarkTheme.subscribe(this.toggleDarkThemeForOverlay);
  }

  private toggleDarkThemeForOverlay = (isDarkTheme: boolean) => {
    const theme = isDarkTheme ? 'dark-theme' : undefined;
    const removeTheme = !isDarkTheme ? 'dark-theme' : undefined;

    this.overlayContainer.getContainerElement().classList.remove(removeTheme);
    this.overlayContainer.getContainerElement().classList.add(theme);
  };
}

export function provideConfig() {
  return (new AuthServiceConfig([
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider('169440150514-6p8qrgf59kceaonb8qvpk10jam8gmaho.apps.googleusercontent.com')
      },
    ])
  );
}
