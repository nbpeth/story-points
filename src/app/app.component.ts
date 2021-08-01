import {AfterViewInit, Component, ElementRef, HostListener, OnInit} from '@angular/core';
import {ThemeService} from './services/theme.service';
import {UserService} from './user.service';
import {combineLatest} from 'rxjs';
import {LocalStorageService} from './services/local-storage.service';

declare const confetti: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  isDarkTheme: boolean;
  isUltraDarkTheme: boolean;

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

  constructor(private elementRef: ElementRef,
              private themeService: ThemeService,
              private lss: LocalStorageService,
              public userService: UserService) {
  }

  ngOnInit() {
    this.themeService.loadState();

    combineLatest(
      this.themeService.isUltraDarkTheme,
      this.themeService.isDarkTheme
    ).subscribe(([isUltraDarkTheme, isDarkTheme]) => {
      this.isDarkTheme = isDarkTheme;
      this.isUltraDarkTheme = isUltraDarkTheme;

      this.toggleClassTheme();
    });

    // issue jwts when auth0 access token changes
    this.userService.getJWT()
      .subscribe((response: { token: string }) => {
        this.lss.set('jwt', response.token);
      });
  }

  ngAfterViewInit() {
    this.toggleClassTheme();
  }

  private toggleClassTheme() {

    if (this.isDarkTheme) {
      this.elementRef.nativeElement.ownerDocument.body.classList.add('dark-theme');
    } else {
      this.elementRef.nativeElement.ownerDocument.body.classList.remove('dark-theme');
    }

    if (this.isUltraDarkTheme) {
      this.elementRef.nativeElement.ownerDocument.body.classList.add('moon');
      this.elementRef.nativeElement.ownerDocument.body.classList.add('dark-theme');
    } else {
      this.elementRef.nativeElement.ownerDocument.body.classList.remove('moon');
    }
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
