import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, skip } from 'rxjs';
import { LoaderService } from '../../core/loader.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent implements OnInit, OnDestroy {
  // يبدأ false — ngOnInit يحدد القيمة الصحيحة بناءً على البيئة
  visible   = false;
  loaderOut = false;
  introOut  = false;
  brandIn   = false;
  lang: 'ar' | 'en' = 'ar';

  readonly arLogo = 'https://res.cloudinary.com/drvtf0l8n/image/upload/v1760708047/%D9%84%D9%88%D8%AC%D9%88_%D8%A7%D8%A8%D9%8A%D8%B6_%D9%A1%D9%A5%D9%A0_%D8%A8%D9%83%D8%B3%D9%84_cbm0mm.png';
  readonly enLogo = 'https://res.cloudinary.com/drvtf0l8n/image/upload/v1761725145/logo_left_doy3cf.png';

  private subs: Subscription[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];

  constructor(
    private loaderSvc: LoaderService,
    private langSvc: LanguageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.subs.push(this.langSvc.currentLang$.subscribe(l => this.lang = l));

    if (!isPlatformBrowser(this.platformId)) return;

    // ابدأ اللودر ظاهر مباشرة عند تحميل الصفحة
    this.visible = true;
    this.open();

    // استجب لأوامر الـ service (skip(1) لتجاهل القيمة الابتدائية للـ BehaviorSubject)
    this.subs.push(
      this.loaderSvc.show$.pipe(skip(1)).subscribe(show => {
        show ? this.open() : this.close();
      })
    );
  }

  private open() {
    this.clearTimers();
    this.loaderOut = false;
    this.introOut  = false;
    this.brandIn   = false;
    this.visible   = true;

    // بعد 1.5s: النص يختفي
    this.timers.push(setTimeout(() => {
      this.introOut = true;
      // بعد 250ms: اللوقو يظهر
      this.timers.push(setTimeout(() => { this.brandIn = true; }, 250));
    }, 1500));
  }

  private close() {
    this.loaderOut = true;
    this.timers.push(setTimeout(() => {
      this.visible   = false;
      this.loaderOut = false;
      this.introOut  = false;
      this.brandIn   = false;
    }, 580));
  }

  private clearTimers() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
  }

  ngOnDestroy() {
    this.clearTimers();
    this.subs.forEach(s => s.unsubscribe());
  }
}
