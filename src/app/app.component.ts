import {Component, OnInit} from '@angular/core';
import {ThemeService} from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isDarkTheme: boolean;
  bgColor: string;

  nighttime: boolean;

  constructor(private themeService: ThemeService) {
  }

  ngOnInit() {
    this.themeService.loadState();
    this.themeService.dynamicDarkValue.subscribe((value: number) => {

      this.isDarkTheme = value <= 50;
      this.nighttime = value <= 20;

      const brightness = (value / 100) * 255;

      this.bgColor = `rgb(${brightness}, ${brightness}, ${brightness})`;

      this.themeService.setDarkTheme(this.isDarkTheme);
    });

  }
}
