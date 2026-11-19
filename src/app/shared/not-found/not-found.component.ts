import { Component, OnInit, inject } from '@angular/core';
import { SERVER_RESPONSE } from '../../core/server-response.token';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { MetaService } from '../../core/meta.service';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule, HeaderComponent, FooterComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit {
  private serverResponse = inject(SERVER_RESPONSE, { optional: true });

  constructor(private meta: MetaService, private _lang: LanguageService) {}

  ngOnInit(): void {
    // مع الـ SSR: السيرفر يرجّع 404 حقيقي عشان جوجل ما يأرشفش الصفحة (Soft 404)
    this.serverResponse?.status(404);

    this._lang.currentLang$.subscribe(lang => {
      const isAr = lang === 'ar';
      this.meta.updateTags({
        title: isAr ? 'الصفحة غير موجودة' : 'Page Not Found',
        description: isAr ? 'الصفحة المطلوبة غير موجودة.' : 'The requested page could not be found.',
        noindex: true,
      });
    });
  }
}
