import {Component, HostListener, OnInit} from '@angular/core';
import {ThemeService} from './services/theme.service';
declare const confetti: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isDarkTheme: boolean;
  bgColor: string;

  nighttime: boolean;
  daytime: boolean;

  konami = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
  ];
  konamiCount = 0;
  sound: any;

  constructor(private themeService: ThemeService) {
  }

  ngOnInit() {
    this.sound = new Audio('assets/sounds/cheering.mp3');
    this.themeService.loadState();
    this.themeService.dynamicDarkValue.subscribe((value: number) => {

      this.isDarkTheme = value <= 50;
      this.nighttime = value <= 20;
      this.daytime = value >= 99;

      const brightness = (value / 100) * 255;

      this.bgColor = `rgb(${brightness}, ${brightness}, ${brightness})`;

      this.themeService.setDarkTheme(this.isDarkTheme);
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === this.konami[this.konamiCount]) {
      this.konamiCount++;
    } else {
      if (this.konamiCount > this.konami.length - 3) {
        window.alert('you were so close and then you disappointed everyone');
      }
      this.konamiCount = 0;
    }

    if (this.konamiCount === this.konami.length) {
      confetti.start(2500);
      this.sound.play();
      this.konamiCount = 0;
    }
  }
}
