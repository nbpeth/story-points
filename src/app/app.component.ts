import { Component, OnInit } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isDarkTheme: boolean;

  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    this.themeService.loadState();
    this.themeService.isDarkTheme.subscribe(isDarkTheme => {
      this.isDarkTheme = isDarkTheme
    });
  }
}
