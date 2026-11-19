import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { IMAGE_CONFIG } from '@angular/common';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

// رقم مع كل تحميل للموقع عشان المتصفح ما يستخدمش نسخة قديمة من ملف الترجمة
// (من غيره المفاتيح الجديدة بتظهر كده: news.related)
const i18nVersion = Date.now();

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', `.json?v=${i18nVersion}`);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
    provideClientHydration(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'ar',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
  ]
};
