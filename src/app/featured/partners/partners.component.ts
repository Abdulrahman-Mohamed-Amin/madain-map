import { Component, Inject, OnInit, OnDestroy, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { PartnerService } from '../../core/services/partner.service';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.css'
})
export class PartnersComponent implements OnInit, OnDestroy {
  @ViewChild('swiperRef1') swiperRef1!: ElementRef;
  @ViewChild('swiperRef2') swiperRef2!: ElementRef;

  url = environment.mediaUrl;
  lang = '';
  partners: any[] = [];

  private swiper1: any;
  private swiper2: any;

  constructor(
    private _partner: PartnerService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private _lang: LanguageService
  ) {}

  ngOnInit(): void {
    this._lang.currentLang$.subscribe(r => this.lang = r);

    this._partner.get().subscribe(res => {
      this.partners = res ?? [];
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initSwiper(), 100);
      }
    });
  }

  private async initSwiper(): Promise<void> {
    const [{ default: Swiper }, { Autoplay }] = await Promise.all([
      import('swiper'),
      import('swiper/modules'),
    ]);

    const commonConfig = {
      modules: [Autoplay],
      loop: true,
      slidesPerView: 'auto' as const,
      spaceBetween: 0,
      speed: 2000,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      allowTouchMove: false,
    };

    const el1 = this.swiperRef1?.nativeElement;
    if (el1) {
      this.swiper1 = new Swiper(el1, commonConfig);
    }

    const el2 = this.swiperRef2?.nativeElement;
    if (el2) {
      this.swiper2 = new Swiper(el2, {
        ...commonConfig,
        autoplay: {
          ...commonConfig.autoplay,
          reverseDirection: true,
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.swiper1?.destroy();
    this.swiper2?.destroy();
  }
}
