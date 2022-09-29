import {BrowserModule, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ActiveSessionTileComponent} from './active-session/active-session-tiles/active-session-tile/active-session-tile.component';
import {ActiveSessionTilesComponent} from './active-session/active-session-tiles/active-session-tiles.component';
import {ActiveSessionComponent} from './active-session/active-session.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

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
// import {BallotDisplayComponent} from './vote-display/ballot-display.component';
import {ActivityLogComponent} from './activity-log/activity-log.component';
import {AuthServiceConfig, GoogleLoginProvider, SocialLoginModule} from 'angularx-social-login';
import {MatMenuModule} from '@angular/material/menu';
import { LoginComponent } from './login/login.component';
import { LoggedInUserComponent } from './logged-in-user/logged-in-user.component';
import {UserService} from './user.service';
import {HttpClientModule} from '@angular/common/http';
import {UsernamePipe} from './pipe/username.pipe';
import {ParseDatePipe} from './pipe/parse-date.pipe';
import { ChangeLogComponent } from './change-log/change-log.component';
import { CreateSessionTileComponent } from './create-session-tile/create-session-tile.component';
import { MatDividerModule } from '@angular/material/divider';
import { ChangelogDialogComponent } from './changelog-dialog/changelog-dialog.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatRadioModule} from '@angular/material/radio';
import {MatBadgeModule} from '@angular/material/badge';
import {MatInputModule} from '@angular/material/input';
import {MatSliderModule} from '@angular/material/slider';
import {MatSidenavModule} from '@angular/material/sidenav';
import {GestureConfig} from '@angular/material/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
// import {AuthClientConfig, AuthModule} from '@auth0/auth0-angular';
// import {AbstractNavigator} from "@auth0/auth0-angular/lib/abstract-navigator";

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
    // BallotDisplayComponent,
    ActivityLogComponent,
    LoginComponent,
    LoggedInUserComponent,
    ChangeLogComponent,
    CreateSessionTileComponent,
    ChangeLogComponent,
    CreateSessionTileComponent,
    ChangelogDialogComponent,
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
    SocialLoginModule,
    MatProgressSpinnerModule,

    // AuthModule.forRoot({
    //   domain: 'proud-recipe-3564.us.auth0.com',
    //   clientId: 'nqBp54zHH9Dl2Vm69NGDORg8QdU8c7lL'
    // }),
  ],
  providers: [
    // AbstractNavigator,
    // AuthClientConfig,
    UserService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig},
  ],
  bootstrap: [AppComponent],
  // tslint:disable-next-line:max-line-length
  entryComponents: [ConfirmDialogComponent, ChangelogDialogComponent, JoinSessionDialogComponent, CreateSessionDialogComponent, AlertSnackbarComponent]

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
