import {Injectable} from '@angular/core';
import {ReplaySubject, Observable} from 'rxjs';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = new ReplaySubject<boolean>(1);
  private ultraDarkTheme = new ReplaySubject<boolean>(1);
  private dynamicDark = new ReplaySubject<number>(1);
  isDarkTheme: Observable<boolean> = this.darkTheme.asObservable();
  isUltraDarkTheme: Observable<boolean> = this.ultraDarkTheme.asObservable();
  // dynamicDarkValue = this.dynamicDark.asObservable();

  constructor(private localStorage: LocalStorageService) {
  }

  setDarkTheme(isDarkTheme: boolean): void {
    this.darkTheme.next(isDarkTheme);
    this.localStorage.setDarkTheme(isDarkTheme);
  }

  setUltraDarkTheme(ultraaaaaa: boolean): void {
    // this.darkTheme.next(ultraaaaaa);
    this.ultraDarkTheme.next(ultraaaaaa);
    this.localStorage.setUltraDarkTheme(ultraaaaaa);
  }

  loadState = (): void => {
    const { isDarkTheme, isUltraDarkTheme } = this.localStorage.getTheme();
    this.setDarkTheme(isDarkTheme);
    this.setUltraDarkTheme(isUltraDarkTheme);
  };

}
