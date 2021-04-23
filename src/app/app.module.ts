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
import {MatMenuModule} from '@angular/material/menu';
import {LoginComponent} from './login/login.component';
import {LoggedInUserComponent} from './logged-in-user/logged-in-user.component';
import {UserService} from './user.service';
import {HttpClientModule} from '@angular/common/http';
import {UsernamePipe} from './pipe/username.pipe';
import {ParseDatePipe} from './pipe/parse-date.pipe';
import {ChangeLogComponent} from './change-log/change-log.component';
import {CreateSessionTileComponent} from './create-session-tile/create-session-tile.component';
import {MatDividerModule} from '@angular/material/divider';
import {BadgePipe} from './pipe/badge.pipe';
import {SessionBadgeIconComponent} from './session-badge-icon/session-badge-icon.component';
import {SplitStringPipe} from './pipe/split-string.pipe';
import {TileBadgeBucketComponent} from './tile-badge-bucket/tile-badge-bucket.component';
import {MatTooltipModule} from '@angular/material/tooltip';

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
    UsernamePipe,
    ParseDatePipe,
    AlertSnackbarComponent,
    ControlPanelComponent,
    JoinSessionDialogComponent,
    AdminControlsComponent,
    VotingBoothComponent,
    BallotDisplayComponent,
    ActivityLogComponent,
    LoginComponent,
    LoggedInUserComponent,
    ChangeLogComponent,
    CreateSessionTileComponent,
    ChangeLogComponent,
    CreateSessionTileComponent,
    BadgePipe,
    SessionBadgeIconComponent,
    SplitStringPipe,
    TileBadgeBucketComponent,
    // TestComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    FormsModule,
    HttpClientModule,
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
    MatDividerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatSliderModule,
    MatTooltipModule,
    SocialLoginModule
  ],
  providers: [
    UserService,
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
    const theme = isDarkTheme ? 'dark-theme' : 'light-theme';
    const removeTheme = !isDarkTheme ? 'dark-theme' : 'light-theme';

    this.overlayContainer.getContainerElement().classList.remove(removeTheme);
    this.overlayContainer.getContainerElement().classList.add(theme);
  }
}

// google provider should be injected from env
export function provideConfig() {
  return (new AuthServiceConfig([
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider('169440150514-6p8qrgf59kceaonb8qvpk10jam8gmaho.apps.googleusercontent.com')
      },
    ])
  );
}
