import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  RouterModule,
  Router,
  Scroll
} from '@angular/router';
import * as AOS from 'aos';
import { filter, skip } from 'rxjs';
import { LoaderService } from './core/loader.service';
import { LanguageService } from './core/language.service';
import { LoaderComponent } from './shared/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'madain';

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private loaderSvc: LoaderService,
    private langSvc: LanguageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // ── تحميل الصفحة الأولي ────────────────────────────────────
    // اللودر يبدأ ظاهر تلقائياً في loader.component
    // نطلب إخفاءه بعد انتهاء مدة minDuration
    this.loaderSvc.hide();

    // ── التنقل بين الصفحات ─────────────────────────────────────
    this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        this.loaderSvc.show();
      } else if (
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      ) {
        this.loaderSvc.hide();
      }
    });

    // ── تغيير اللغة ────────────────────────────────────────────
    this.langSvc.currentLang$.pipe(skip(1)).subscribe(() => {
      this.loaderSvc.show(2000);
      this.loaderSvc.hide();
    });

    // ── AOS ────────────────────────────────────────────────────
    AOS.init({ duration: 1200, once: true });

    this.router.events.pipe(filter(e => e instanceof Scroll)).subscribe(() => {
      requestAnimationFrame(() => requestAnimationFrame(() => AOS.refresh()));
    });

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      window.scrollTo(0, 0);
      setTimeout(() => AOS.refresh(), 3000);
    });
  }
}
