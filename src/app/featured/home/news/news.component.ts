import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NewsService } from '../../../core/services/news.service';
import { News } from '../../../core/interface/news';
import { isPlatformBrowser } from '@angular/common';
import Swiper from 'swiper';
import { LanguageService } from '../../../core/language.service';
import { TranslateModule } from '@ngx-translate/core';

interface VideoState {
  playing: boolean;
  muted: boolean;
  progress: number;
  currentTime: string;
  duration: string;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent implements OnInit {
  url = environment.mediaUrl;
  news: News[] = [];
  lang: string = '';
  swiper?: Swiper;
  videoStates: { [key: number]: VideoState | undefined } = {};

  constructor(
    private _news: NewsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private _lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.getNews();
    this._lang.currentLang$.subscribe(res => { this.lang = res; });
  }

  getNews() {
    this._news.getNews().subscribe(res => {
      this.news = res;
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initSwiper());
      }
    });
  }

  initSwiper() {
    if (this.swiper) this.swiper.destroy(true, true);
    this.swiper = new Swiper('.mySwiper2', {
      spaceBetween: 20,
      breakpoints: {
        1200: { slidesPerView: 3 },
        768:  { slidesPerView: 2 },
        578:  { slidesPerView: 1 }
      },
      loop: true,
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true, dynamicMainBullets: 1 },
      speed: 500,
    });
  }

  initVideoState(index: number): void {
    if (!this.videoStates[index]) {
      this.videoStates[index] = { playing: false, muted: false, progress: 0, currentTime: '0:00', duration: '0:00' };
    }
  }

  togglePlay(video: HTMLVideoElement, index: number): void {
    this.initVideoState(index);
    const state = this.videoStates[index]!;
    if (video.paused) {
      video.play();
      state.playing = true;
    } else {
      video.pause();
      state.playing = false;
    }
  }

  onTimeUpdate(video: HTMLVideoElement, index: number): void {
    const state = this.videoStates[index];
    if (state) {
      state.progress = (video.currentTime / video.duration) * 100 || 0;
      state.currentTime = this.formatTime(video.currentTime);
    }
  }

  onMetadata(video: HTMLVideoElement, index: number): void {
    this.initVideoState(index);
    this.videoStates[index]!.duration = this.formatTime(video.duration);
  }

  onEnded(index: number): void {
    if (this.videoStates[index]) {
      this.videoStates[index].playing = false;
      this.videoStates[index].progress = 0;
    }
  }

  seek(video: HTMLVideoElement, event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const percent = Number(input.value);
    video.currentTime = (percent / 100) * video.duration;
    if (this.videoStates[index]) {
      this.videoStates[index].progress = percent;
    }
  }

  toggleMute(video: HTMLVideoElement, index: number): void {
    video.muted = !video.muted;
    if (this.videoStates[index]) {
      this.videoStates[index].muted = video.muted;
    }
  }

  toggleFullscreen(wrapper: HTMLElement): void {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapper.requestFullscreen();
    }
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
