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
  successSound: HTMLAudioElement;
  failSound: HTMLAudioElement;

  music: HTMLAudioElement;

  constructor(private themeService: ThemeService) {
  }

  ngOnInit() {
    this.successSound = new Audio('assets/sounds/cheering.mp3');
    this.failSound = new Audio('assets/sounds/fail.mp3');

    this.themeService.loadState();
    this.themeService.dynamicDarkValue.subscribe((value: number) => {
      this.setThemeFrom(value);

      this.themeService.setDarkTheme(this.isDarkTheme);
    });
  }

  private setThemeFrom = (value: number) => {
    this.isDarkTheme = value <= 50;
    this.nighttime = value <= 20;
    this.daytime = value >= 99;

    this.bgColor = this.setBackgroundBrightnessFrom(value);

    if (this.daytime) {
      this.music = new Audio('assets/sounds/twochords_and_a_glockenspiel.mp3');
      this.music.loop = true;
      this.music.play();
    } else if (this.nighttime) {
      this.music = new Audio('assets/sounds/nighttime.mp3');
      this.music.loop = true;
      this.music.play();
    } else {
      if (this.music) {
        this.music.loop = false;
        this.music.pause();
      }
    }
  }

  private setBackgroundBrightnessFrom = (value: number): string => {
    const brightness = (value / 100) * 255;
    return `rgb(${brightness}, ${brightness}, ${brightness})`;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === this.konami[this.konamiCount]) {
      this.konamiCount++;
    } else {
      if (this.konamiCount > this.konami.length - 3) {
        this.failSound.play();
        window.alert('you were so close to glory and then you disappointed everyone');
      }
      this.konamiCount = 0;
    }

    if (this.konamiCount === this.konami.length) {
      confetti.start(2500);
      this.successSound.play();
      this.konamiCount = 0;
    }
  }
}
