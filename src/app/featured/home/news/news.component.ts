import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, QueryList, ViewChildren } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NewsService } from '../../../core/services/news.service';
import { News } from '../../../core/interface/news';
import { isPlatformBrowser } from '@angular/common';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
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
export class NewsComponent implements OnInit, AfterViewInit, OnDestroy {
  url = environment.mediaUrl;
  news: News[] = [];
  lang: string = '';
  swiper?: Swiper;
  videoStates: { [key: number]: VideoState | undefined } = {};

  @ViewChildren('videoEl') videoEls!: QueryList<ElementRef<HTMLVideoElement>>;
  private videoObserver?: IntersectionObserver;

  constructor(
    private _news: NewsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private _lang: LanguageService
  ) {}

  ngOnInit(): void {
    this.getNews();
    this._lang.currentLang$.subscribe(res => { this.lang = res; });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.videoEls.changes.subscribe(() => this.observeVideos());
    this.observeVideos();
  }

  ngOnDestroy(): void {
    this.videoObserver?.disconnect();
  }

  /** يحمّل الفيديو (metadata) فقط لما يقرب من دخول الشاشة */
  private observeVideos(): void {
    this.videoObserver?.disconnect();
    this.videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          this.loadVideoSrc(video);
        }
      });
    }, { rootMargin: '300px' });
    this.videoEls.forEach(ref => this.videoObserver!.observe(ref.nativeElement));
  }

  private loadVideoSrc(video: HTMLVideoElement): void {
    if (video.src) return;
    const src = video.dataset['src'];
    if (src) {
      video.preload = 'metadata';
      video.src = src;
    }
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
      modules: [Navigation, Pagination, Autoplay],
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
      on: {
        slideChange: () => this.pauseAllVideos(),
      },
    });
  }

  pauseAllVideos(): void {
    document.querySelectorAll<HTMLVideoElement>('.mySwiper2 video').forEach((v, i) => {
      if (!v.paused) {
        v.pause();
        if (this.videoStates[i]) this.videoStates[i]!.playing = false;
      }
    });
  }

  initVideoState(index: number): void {
    if (!this.videoStates[index]) {
      this.videoStates[index] = { playing: false, muted: false, progress: 0, currentTime: '0:00', duration: '0:00' };
    }
  }

  togglePlay(video: HTMLVideoElement, index: number): void {
    this.initVideoState(index);
    this.loadVideoSrc(video);
    const state = this.videoStates[index]!;
    if (video.paused) {
      // لو لسه على الـ thumbnail frame ارجع للأول
      if (!state.playing && video.currentTime > 0 && video.currentTime < 4) {
        video.currentTime = 0;
      }
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
    // seek to 1s to show a video frame instead of black screen
    if (!this.videoStates[index]!.playing) {
      video.currentTime = Math.min(3, video.duration * 0.05);
    }
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
