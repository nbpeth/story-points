import {Component, OnInit} from '@angular/core';
import {ThemeService} from '../services/theme.service';
import {Observable} from 'rxjs';
import {MatSliderChange} from "@angular/material";

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],

})
export class ThemeToggleComponent implements OnInit {
  isDarkTheme: Observable<boolean>;
  sliderValue: number;

  constructor(private themeService: ThemeService) {
  }

  ngOnInit() {
    this.isDarkTheme = this.themeService.isDarkTheme;
    this.themeService.dynamicDarkValue.subscribe(value => {
      this.sliderValue = value;
    })
  }

  sliderChanged = (event: MatSliderChange) => {
    this.themeService.setDarkValue(event.value);
  }
}

