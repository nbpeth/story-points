import {AfterViewInit, Component, ElementRef, HostListener, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ThemeService} from './services/theme.service';
import {UserService} from './user.service';

declare const confetti: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnChanges {
  isDarkTheme: boolean;
  bgColor: string;

  nighttime: boolean;

  // should be a service
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

  constructor(private elementRef: ElementRef, private themeService: ThemeService, private userService: UserService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('bgColor')) {
      this.setBackgroundColor();
    }
  }

  ngOnInit() {
    this.themeService.loadState();
    this.themeService.dynamicDarkValue.subscribe((value: number) => {
      this.setThemeFrom(value);

      this.themeService.setDarkTheme(this.isDarkTheme);
      this.setBackgroundColor();
    });
  }

  ngAfterViewInit() {
    this.setBackgroundColor();
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  private setBackgroundColor() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = this.bgColor;
    this.toggleClassTheme();
  }

  private toggleClassTheme() {
    if (this.nighttime) {
      this.elementRef.nativeElement.ownerDocument.body.classList.add('moon');
    } else {
      this.elementRef.nativeElement.ownerDocument.body.classList.remove('moon');
    }

    if (this.isDarkTheme) {
      this.elementRef.nativeElement.ownerDocument.body.classList.add('dark-theme');

    } else {
      this.elementRef.nativeElement.ownerDocument.body.classList.remove('dark-theme');
    }
  }

  private setThemeFrom = (value: number) => {
    this.isDarkTheme = value <= 50;
    this.nighttime = value <= 20;
    this.bgColor = this.setBackgroundBrightnessFrom(value);
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
        // this.failSound.play();
        window.alert('you were so close to glory and then you disappointed everyone');
      }
      this.konamiCount = 0;
    }

    if (this.konamiCount === this.konami.length) {
      confetti.start(2500);
      // this.successSound.play();
      this.konamiCount = 0;
    }
  }
}
