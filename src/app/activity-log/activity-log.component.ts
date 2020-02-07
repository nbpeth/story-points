import {Component, Input, OnInit} from '@angular/core';
import {ThemeService} from '../services/theme.service';

@Component({
  selector: 'activity-log',
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})
export class ActivityLogComponent implements OnInit {
  @Input() logs: string[];
  isDarkTheme: boolean;

  constructor(private themeService: ThemeService) {
  }

  ngOnInit() {
    this.themeService.isDarkTheme.subscribe((isIt: boolean) => {
      this.isDarkTheme = isIt;
    });
  }
}
