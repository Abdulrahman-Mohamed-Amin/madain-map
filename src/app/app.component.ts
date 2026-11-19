import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import {
  NavigationEnd,
  RouterModule,
  Router,
  Scroll
} from '@angular/router';
import * as AOS from 'aos';
import { filter } from 'rxjs';
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
    // اللودر بيظهر مرة واحدة بس أول ما الزائر يفتح الموقع —
    // مش مع التنقل بين الصفحات ولا تغيير اللغة (كان مزعج).
    // show() هنا بتسجّل وقت البداية، و hide() بتخفيه بعد انتهاء مدة minDuration
    this.loaderSvc.show();
    this.loaderSvc.hide();
    // شاشة البداية الثابتة من index.html بتتشال بعد ما لودر Angular يكون ظهر (مدة fade-in بتاعه 0.3s)
    setTimeout(() => document.getElementById('boot-loader')?.remove(), 350);

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
