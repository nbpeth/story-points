import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = new ReplaySubject<boolean>(1);
  private dynamicDark = new ReplaySubject<number>(1);
  isDarkTheme = this.darkTheme.asObservable();
  dynamicDarkValue = this.dynamicDark.asObservable();

  constructor(private localStorage: LocalStorageService) {
  }

  setDarkTheme(isDarkTheme: boolean): void {
    this.darkTheme.next(isDarkTheme);
    this.localStorage.setTheme(isDarkTheme);
  }

  setDarkValue = (value: number) => {
    this.dynamicDark.next(value);
    this.localStorage.setDarkValue(value);
  };

  loadState = (): void => {
    const isDarkThemeFromStorage = this.localStorage.getTheme();
    this.setDarkTheme(isDarkThemeFromStorage);

    const dynamicDarkValueFromStorage = this.localStorage.getDarkValue();
    this.setDarkValue(dynamicDarkValueFromStorage >= 0 ? dynamicDarkValueFromStorage : 50);
  };

}
