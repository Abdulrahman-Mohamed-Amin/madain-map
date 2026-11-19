import { Component, Inject, OnInit, OnDestroy, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { PartnerService } from '../../core/services/partner.service';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-partners',
  // البيانات حيّة من الـ API وممكن تختلف عن نسخة الـ prerender (خبر/مشروع اتضاف أو اتغير بعد الـ build).
  // من غير ده Angular بيعيد استخدام الـ HTML القديم وبيفضل فيه صور/حالات غلط، فبنرسم الجزء ده من جديد في المتصفح.
  host: { ngSkipHydration: 'true' },
  standalone: true,
  imports: [],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.css'
})
export class PartnersComponent implements OnInit, OnDestroy {
  @ViewChild('swiperRef') swiperRef!: ElementRef<HTMLElement>;
  @ViewChild('prevBtn') prevBtn!: ElementRef<HTMLElement>;
  @ViewChild('nextBtn') nextBtn!: ElementRef<HTMLElement>;

  url = environment.mediaUrl;
  lang = '';
  partners: any[] = [];

  private swiper: any;

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
    const [{ default: Swiper }, { Autoplay, Navigation }] = await Promise.all([
      import('swiper'),
      import('swiper/modules'),
    ]);

    const el = this.swiperRef?.nativeElement;
    if (!el) return;

    this.swiper?.destroy(true, true);
    // حركة بخطوات سريعة: وقفة قصيرة (0.5 ثانية) وانتقال ناعم أطول منها عشان الحركة تبان متصلة
    this.swiper = new Swiper(el, {
      modules: [Autoplay, Navigation],
      loop: true,
      slidesPerView: 3,
      spaceBetween: 10,
      speed: 550,
      autoplay: {
        delay: 500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      navigation: {
        prevEl: this.prevBtn.nativeElement,
        nextEl: this.nextBtn.nativeElement,
      },
      breakpoints: {
        576: { slidesPerView: 3, spaceBetween: 20 },
        992: { slidesPerView: 4, spaceBetween: 24 },
      },
    });
  }

  ngOnDestroy(): void {
    this.swiper?.destroy(true, true);
  }
}
