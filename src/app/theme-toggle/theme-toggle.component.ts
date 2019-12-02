import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit {
  isDarkTheme: Observable<boolean>;
  constructor(private themeService: ThemeService) { }

  ngOnInit() {
    this.isDarkTheme = this.themeService.isDarkTheme;
  }

  toggleDarkTheme = (checked: boolean) => {
    this.themeService.setDarkTheme(checked);
  }
}
