import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NewsThumbComponent } from '../../shared/news-thumb/news-thumb.component';
import { News } from '../../core/interface/news';
import { NewsService } from '../../core/services/news.service';
import { LanguageService } from '../../core/language.service';
import { MetaService } from '../../core/meta.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, NewsThumbComponent, RouterLink, TranslateModule],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.css'
})
export class NewsListComponent implements OnInit, OnDestroy {
  news: News[] = [];
  loading = true;
  lang: string = '';
  private subs = new Subscription();

  constructor(
    private _news: NewsService,
    private _lang: LanguageService,
    private meta: MetaService
  ) {}

  ngOnInit(): void {
    this._news.getNews().subscribe({
      next: res => {
        // الأحدث الأول
        this.news = [...res].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
        this.loading = false;
      },
      error: () => this.loading = false
    });

    this.subs.add(this._lang.currentLang$.subscribe(res => {
      this.lang = res;
      this.updateMeta();
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  title(n: News): string {
    return this.lang == 'ar' ? n.arTitle : n.enTitle;
  }

  description(n: News): string {
    return this.lang == 'ar' ? n.arDescription : n.enDescription;
  }

  updateMeta() {
    this.meta.updateTags({
      // نص ثابت بدل translate.instant عشان ملف الترجمة ممكن يكون لسه ما اتحمّلش
      title: this.lang == 'ar' ? 'الأخبار' : 'News',
      description: this.lang == 'ar'
        ? 'آخر أخبار شركة مدائن العقارية: الاتفاقيات والشراكات والمشاريع الجديدة والفعاليات.'
        : 'The latest news from Madain Real Estate: agreements, partnerships, new projects and events.',
      url: 'https://madain.sa/news',
    });
  }
}
