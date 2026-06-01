// src/app/services/language.service.ts

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private currentLangSubject = new BehaviorSubject<'ar' | 'en'>('ar');
  currentLang$ = this.currentLangSubject.asObservable();

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let lang: 'ar' | 'en' = 'ar';

    if (isPlatformBrowser(this.platformId)) {
      const storedLang = localStorage.getItem('app-lang');
      if (storedLang === 'ar' || storedLang === 'en') {
        lang = storedLang;
      }
    }

    this.setLang(lang, false);
  }

  get currentLang(): 'ar' | 'en' {
    return this.currentLangSubject.value;
  }

  setLang(lang: 'ar' | 'en', persist: boolean = true) {
    this.currentLangSubject.next(lang);
    this.translate.use(lang);

    if (isPlatformBrowser(this.platformId)) {
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', lang);

      document.documentElement.classList.remove(lang === 'ar' ? 'en' : 'ar');
      document.documentElement.classList.add(lang);

      if (persist) {
        localStorage.setItem('app-lang', lang);
      }
    }
  }

  switchLang() {
    const newLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.setLang(newLang);
  }
}
