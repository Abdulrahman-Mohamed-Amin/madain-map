import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {

  open = true;
  current = '';

  currentLan = 'عر';
  currentFlag =
    'https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg';

  constructor(
    public languageService: LanguageService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang'); // نقرأ اللغة

      if (savedLang) {
        this.currentLan = savedLang;
        this.updateFlag(); // نحدّد العلم بناءً على اللغة
      }
    }

  }

  toggleLanguage() {

    // التبديل بين العربية والإنجليزية
    this.currentLan = this.currentLan === 'عر' ? 'EN' : 'عر';

    this.updateFlag();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', this.currentLan); // نخزن اللغة فقط
    }

    this.languageService.switchLang();
    this.cdr.detectChanges();
  }

  // دالة لتحديث العلم بناءً على اللغة
  updateFlag() {
    if (this.currentLan === 'عر') {
      this.currentFlag =
        'https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg';
    } else {
      this.currentFlag =
        'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg';
    }
  }

  get currentLang() {
    return this.languageService.currentLang;
  }

}