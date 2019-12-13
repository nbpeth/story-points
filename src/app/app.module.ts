import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ActiveSessionTileComponent } from './active-session/active-session-tiles/active-session-tile/active-session-tile.component';
import { ActiveSessionTilesComponent } from './active-session/active-session-tiles/active-session-tiles.component';
import { ActiveSessionComponent } from './active-session/active-session.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule, MatSlideToggleModule,
  MatToolbarModule,
  MatDialogModule
} from '@angular/material';
import { UserTileComponent } from './active-session/user-tile/user-tile.component';
import { UserTilesComponent } from './active-session/user-tiles/user-tiles.component';
import { DragDropModule } from "@angular/cdk/drag-drop";
import { TitlebarComponent } from './titlebar/titlebar.component';
import { ThemeToggleComponent } from './theme-toggle/theme-toggle.component';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { SearchBoxComponent } from './search-box/search-box.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ThemeService } from './services/theme.service';
import { CreateSessionDialogComponent } from './create-session-dialog/create-session-dialog.component';

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
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    DragDropModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatBadgeModule,
    MatSlideToggleModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmDialogComponent, CreateSessionDialogComponent]

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
