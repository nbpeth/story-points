import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = new ReplaySubject<boolean>(1);
  isDarkTheme = this.darkTheme.asObservable();

  setDarkTheme(isDarkTheme: boolean): void {
    this.darkTheme.next(isDarkTheme);
    this.localStorage.setTheme(isDarkTheme);
  }

  constructor(private localStorage: LocalStorageService) {
  }

  loadState = (): void => {
    const isDarkThemeFromStorage = this.localStorage.getTheme();
    this.setDarkTheme(isDarkThemeFromStorage);
  };
}
