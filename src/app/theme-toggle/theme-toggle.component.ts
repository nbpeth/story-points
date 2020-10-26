import {Component, OnInit} from '@angular/core';
import {ThemeService} from '../services/theme.service';
import {Observable, combineLatest} from 'rxjs';
import {take} from 'rxjs/operators';
import {MatSlideToggleChange} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
})

export class ThemeToggleComponent implements OnInit {
  isDarkTheme: Observable<boolean>;
  isDarkMode: boolean;
  isUltraDarkMode: boolean;


  constructor(private themeService: ThemeService) {
    combineLatest(
      this.themeService.isUltraDarkTheme,
      this.themeService.isDarkTheme
    ).subscribe(([isUltraDarkTheme, isDarkTheme]) => {
      this.isDarkMode = isDarkTheme;
      this.isUltraDarkMode = isUltraDarkTheme;
    });
  }

  setIsDarkMode(e: MatSlideToggleChange) {
    this.themeService.setDarkTheme(e.checked);
  }

  setIsUltraDarkMode(e: MatSlideToggleChange) {
    this.themeService.setUltraDarkTheme(e.checked);
  }

  ngOnInit() {
    this.isDarkTheme = this.themeService.isDarkTheme;
  }
}

