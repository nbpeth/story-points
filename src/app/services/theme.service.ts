import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private dynamicDarkStorageKey = 'dynamicDarkRating';
  private darkTheme = new ReplaySubject<boolean>(1);
  private dynamicDark = new ReplaySubject<number>(1);
  isDarkTheme = this.darkTheme.asObservable();
  dynamicDarkValue = this.dynamicDark.asObservable();

  constructor(private localStorage: LocalStorageService,
              @Inject(LOCAL_STORAGE) private storage: StorageService) {

  setDarkTheme(isDarkTheme: boolean): void {
    this.darkTheme.next(isDarkTheme);
    this.localStorage.setTheme(isDarkTheme);
  }

  setDarkValue = (value: number) => {
    this.dynamicDark.next(value);
    this.storage.set(this.dynamicDarkStorageKey, value);
  }

  loadState = (): void => {
    const isDarkThemeFromStorage = this.storage.get(this.darkThemeStorageKey);
    this.setDarkTheme(isDarkThemeFromStorage);

    const dynamicDarkValueFromStorage = this.storage.get(this.dynamicDarkStorageKey);
    this.setDarkValue(dynamicDarkValueFromStorage ? dynamicDarkValueFromStorage : 50);
  }

}
