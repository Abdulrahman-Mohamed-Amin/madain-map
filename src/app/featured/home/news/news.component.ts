import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { NewsService } from '../../../core/services/news.service';

import { News } from '../../../core/interface/news';
import { isPlatformBrowser } from '@angular/common';
import Swiper from 'swiper';
import { LanguageService } from '../../../core/language.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent implements OnInit {
  url = environment.mediaUrl
  news: News[] = []
  lang: string = ''
  swiper?: Swiper;
  constructor(private _news: NewsService, @Inject(PLATFORM_ID) private platformId: Object, private _lang: LanguageService) { }

  ngOnInit(): void {
    this.getNews()

    this._lang.currentLang$.subscribe(res => {
      this.lang = res
    })
  }

  getNews() {
    this._news.getNews().subscribe(res => {
      this.news = res;

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initSwiper()); // بعد ما الـ DOM يتحدث
      }
    })
  }

  initSwiper() {
    if (this.swiper) this.swiper.destroy(true, true);
    this.swiper = new Swiper('.mySwiper2', {
      spaceBetween: 20,
      breakpoints: {
        1200: { slidesPerView: 3 },
        768: { slidesPerView: 2 },
        578: { slidesPerView: 1 }
      },
      loop: true,
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true, dynamicMainBullets: 1 },
      speed: 500,
    });
  }



  togglePlay(video: HTMLVideoElement) {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  seek(video: HTMLVideoElement, event: any) {
    const percent = event.target.value;
    video.currentTime = (percent / 100) * video.duration;
  }

}
