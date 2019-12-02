import { Injectable, Inject, OnInit } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeStorageKey = 'isDarkTheme';
  private darkTheme = new ReplaySubject<boolean>(1);
  isDarkTheme = this.darkTheme.asObservable();

  setDarkTheme(isDarkTheme: boolean): void {
    this.darkTheme.next(isDarkTheme);
    this.storage.set(this.darkThemeStorageKey, isDarkTheme);
  }
  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
  }

  loadState = (): void => {
    const isDarkThemeFromStorage = this.storage.get(this.darkThemeStorageKey);
    this.setDarkTheme(isDarkThemeFromStorage);
  }
}
