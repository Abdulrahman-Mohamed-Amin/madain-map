import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NewsThumbComponent } from '../../shared/news-thumb/news-thumb.component';
import { environment } from '../../../environments/environment';
import { News } from '../../core/interface/news';
import { NewsService } from '../../core/services/news.service';
import { LanguageService } from '../../core/language.service';
import { MetaService } from '../../core/meta.service';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, NewsThumbComponent, RouterLink, TranslateModule],
  templateUrl: './news-details.component.html',
  styleUrl: './news-details.component.css'
})
export class NewsDetailsComponent implements OnInit, OnDestroy {
  url = environment.mediaUrl;
  news: News | null = null;
  related: News[] = [];
  lang: string = '';
  activeImage = 0;
  private subs = new Subscription();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _news: NewsService,
    private _lang: LanguageService,
    private meta: MetaService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.subs.add(this._route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) {
        this._router.navigate(['/404'], { skipLocationChange: true });
        return;
      }
      this.getNews(id);
      this.getRelated(id);
    }));

    this.subs.add(this._lang.currentLang$.subscribe(res => {
      this.lang = res;
      this.updateMeta();
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getNews(id: number) {
    this.news = null;
    this.activeImage = 0;
    this._news.getNewsById(id).subscribe({
      next: res => {
        if (!res) {
          this._router.navigate(['/404'], { skipLocationChange: true });
          return;
        }
        this.news = res;
        this.updateMeta();
      },
      error: () => this._router.navigate(['/404'], { skipLocationChange: true })
    });
  }

  get title(): string {
    return (this.lang == 'ar' ? this.news?.arTitle : this.news?.enTitle) ?? '';
  }

  get description(): string {
    return (this.lang == 'ar' ? this.news?.arDescription : this.news?.enDescription) ?? '';
  }

  itemTitle(n: News): string {
    return this.lang == 'ar' ? n.arTitle : n.enTitle;
  }

  /** خبرين عشوائيين غير الخبر الحالي — في المتصفح بس عشان الـ prerender ما يثبّتش نفس الاختيار */
  private getRelated(currentId: number) {
    this.related = [];
    if (!isPlatformBrowser(this.platformId)) return;
    this._news.getNews().subscribe(list => {
      const others = list.filter(n => n.id !== currentId);
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      this.related = others.slice(0, 2);
    });
  }

  updateMeta() {
    if (!this.news) return;
    const image = this.news.imagePaths?.length ? this.url + this.news.imagePaths[0] : undefined;
    this.meta.updateTags({
      title: this.title,
      description: this.description.slice(0, 160),
      url: `https://madain.sa/news/${this.news.id}`,
      image,
      imageAlt: this.title,
    });
  }
}
