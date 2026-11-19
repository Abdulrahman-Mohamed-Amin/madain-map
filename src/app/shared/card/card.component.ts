import {
  Component, Input, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, Inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, NgClass, CommonModule } from '@angular/common';
import { Project } from '../../core/interface/project';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';
import { LanguageService } from '../../core/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectsService } from '../../core/services/projects.service';
import { toSlug } from '../../core/utils/slug.util';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [RouterModule, TranslateModule, NgClass, CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() project?: Project;
  @ViewChild('cardEl') cardEl!: ElementRef<HTMLElement>;

  url = environment.mediaUrl;
  lang = '';
  animatedPct = 0;

  /** SVG circle r=28 → circumference = 2π×28 */
  readonly circumference = 2 * Math.PI * 28;

  /** عدد الوحدات المباعة بعد تحميل التفاصيل */
  private fetchedSoldCount: number | null = null;

  private observer?: IntersectionObserver;

  constructor(
    private _lang: LanguageService,
    private _projects: ProjectsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this._lang.currentLang$.subscribe(res => { this.lang = res; });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.loadAndAnimate();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (this.cardEl?.nativeElement) {
      this.observer.observe(this.cardEl.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /** نسبة الوحدات المباعة 0–100 */
  get soldPct(): number {
    const p = this.project;
    if (!p) return 0;
    if (p.projectStatusArName === 'قريبا') return 0;
    if (p.isSealed) return 100;

    // 1) حقل مباشر من الـ list API لو البكند أضافه
    if (p.soldUnitsCount !== undefined && p.unitsCount > 0) {
      return Math.round(p.soldUnitsCount / p.unitsCount * 100);
    }

    // 2) بعد تحميل التفاصيل lazy
    if (this.fetchedSoldCount !== null && p.unitsCount > 0) {
      return Math.round(this.fetchedSoldCount / p.unitsCount * 100);
    }

    // 3) لو كانت buildings.units متاحة (صفحة التفاصيل)
    const all = (p.buildings ?? []).flatMap(b => b.units ?? []);
    if (all.length > 0) {
      return Math.round(all.filter(u => u.isSealed).length / all.length * 100);
    }

    return 0;
  }

  /** stroke-dashoffset بناءً على النسبة الحالية */
  getDashOffset(pct: number): number {
    return this.circumference * (1 - pct / 100);
  }

  /**
   * لما الكارد يدخل الـ viewport:
   * لو البيانات متاحة → حرّك مباشرة
   * لو لا → اطلب التفاصيل مرة واحدة بس، وبعدين حرّك
   */
  private loadAndAnimate(): void {
    const p = this.project;
    if (!p || p.projectStatusArName === 'قريبا') return;
    if (p.isSealed) { this.runAnimation(); return; }

    // لو soldUnitsCount موجود أو buildings.units موجودة → شغّل مباشرة
    const hasDirectCount = p.soldUnitsCount !== undefined;
    const hasUnits = (p.buildings ?? []).flatMap(b => b.units ?? []).length > 0;
    if (hasDirectCount || hasUnits) {
      this.runAnimation();
      return;
    }

    // طلب واحد بس للـ API عشان نجيب عدد الوحدات المباعة
    this._projects.getProjetById(p.id).subscribe({
      next: (full) => {
        const all = (full.buildings ?? []).flatMap(b => b.units ?? []);
        this.fetchedSoldCount = all.filter(u => u.isSealed).length;
        this.runAnimation();
      },
      error: () => { /* فشل التحميل، الحلقة تفضل 0 */ }
    });
  }

  /** أنيميشن الحلقة من 0 إلى soldPct */
  private runAnimation(): void {
    const target = this.soldPct;
    if (target === 0) return;
    const duration = 1400;
    const inc = target / (duration / 16);
    let cur = 0;
    const tick = () => {
      cur = Math.min(cur + inc, target);
      this.animatedPct = Math.round(cur);
      if (cur < target) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  toSlug(name: string | undefined): string {
    return toSlug(name);
  }
}
