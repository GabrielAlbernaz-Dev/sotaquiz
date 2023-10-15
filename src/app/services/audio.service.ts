import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioSrc : string = '';
  public currentTime: number = 0;
  public volume = 50;
  public timeUpdateSubscription!: Subscription;
  public audioPlayer = new Audio();

  constructor() { }

  public changeAudioSrc(letter : string) {
    this.audioSrc = `assets/audio-quiz/sotaquiz-${letter}.ogg`;
  }

  public getAudioSrc() {
    return this.audioSrc;
  }

  public resetAudioPlayerTime() {
    this.audioPlayer.currentTime = 0;
  }

  public changeSrcAndResetAudioTime(letter: string) {
    
    this.changeAudioSrc(letter);
    this.resetAudioPlayerTime();
  }
}
