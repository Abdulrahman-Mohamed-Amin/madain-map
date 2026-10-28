import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { LanguageService } from './language.service';

export interface MetaConfig {
  /** اسم الصفحة فقط (مثال: "من نحن") — اسم الموقع بيتضاف تلقائيًا */
  title: string;
  description: string;
  url?: string;
  keywords?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  noindex?: boolean;
  /** true للصفحة الرئيسية: يظهر اسم الموقع فقط بدون " | " */
  homePage?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private readonly siteName: Record<'ar' | 'en', string> = {
    ar: 'شركة مدائن العقارية',
    en: 'Madain Real Estate',
  };

  constructor(
    private meta: Meta,
    private title: Title,
    private lang: LanguageService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  /** يبني عنوان التبويب بصيغة: "اسم الصفحة | اسم الموقع" */
  private buildTitle(config: MetaConfig): string {
    const site = this.siteName[this.lang.currentLang] ?? this.siteName.ar;
    if (config.homePage || !config.title) return site;
    return `${config.title} | ${site}`;
  }

  updateTags(config: MetaConfig) {
    const fullTitle = this.buildTitle(config);
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: config.description });
    if (config.image) {
      this.meta.updateTag({ property: 'og:image', content: config.image });
      this.meta.updateTag({ name: 'twitter:image', content: config.image });
      if (config.imageWidth) this.meta.updateTag({ property: 'og:image:width', content: String(config.imageWidth) });
      if (config.imageHeight) this.meta.updateTag({ property: 'og:image:height', content: String(config.imageHeight) });
      if (config.imageAlt) this.meta.updateTag({ property: 'og:image:alt', content: config.imageAlt });
    }
    this.meta.updateTag({
      name: 'robots',
      content: config.noindex ? 'noindex, follow' : 'index, follow'
    });

    const canonicalUrl = config.url ?? this.doc.location.href;
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.setCanonical(canonicalUrl);
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setJsonLd(data: object, id = 'page-jsonld'): void {
    let script = this.doc.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  removeJsonLd(id = 'page-jsonld'): void {
    this.doc.getElementById(id)?.remove();
  }
}
