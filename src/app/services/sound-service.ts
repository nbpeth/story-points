import {Injectable} from '@angular/core';
import {AppState} from './local-storage.model';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioEnabled: boolean;
  private successSound: HTMLAudioElement = new Audio('assets/sounds/cheering.mp3');
  private dingSound: HTMLAudioElement = new Audio('assets/sounds/ding.mp3');

  constructor(private lss: LocalStorageService) {
    lss.stateEventStream().subscribe((state: AppState) => {
      this.audioEnabled = state.globals.audioEnabled;
    });
  }


  playSuccess = () => {
    if (this.audioEnabled) {
      this.successSound.play();
    }
  }

  ding = () => {
    if (this.audioEnabled) {
      this.dingSound.play();
    }
  }
}
