import { Component, OnInit } from '@angular/core';

import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { MetaService } from '../../core/meta.service';
import { ProjComponent } from "../home/proj/proj.component";
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/interface/project';
import { CardComponent } from "../../shared/card/card.component";
import { LanguageService } from '../../core/language.service';
@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, TranslateModule, CardComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
})
export class ProjectsComponent implements OnInit {
  city: string | null = null

  projects: Project[] = []

  lang:string = ''

  private readonly cityMeta: Record<string, { ar: string; en: string }> = {
    makkah: { ar: 'مكة المكرمة', en: 'Makkah' },
    madena: { ar: 'المدينة المنورة', en: 'Madinah' },
    jeddah: { ar: 'جدة', en: 'Jeddah' },
  };

  constructor(private meta: MetaService, private _route: ActivatedRoute, private _projects: ProjectsService , private _lang:LanguageService) {
  }

  ngOnInit(): void {
    this.getCity()
    this._lang.currentLang$.subscribe(res => {
      this.lang = res
      this.updateMeta()
    })
  }

  getCity() {
    this._route.paramMap.subscribe(res => {
      this.city = res.get('city')
      this.updateMeta()
      this.getProjects()
    })
  }

  private updateMeta(): void {
    const isAr = this.lang !== 'en';
    // نفس منطق العرض في القالب: أي مدينة غير makkah/madena تُعامل كجدة
    const cityKey = !this.city ? null : (this.city === 'makkah' || this.city === 'madena') ? this.city : 'jeddah';
    const city = cityKey ? this.cityMeta[cityKey] : null;

    const title = city
      ? (isAr ? `مشاريعنا في ${city.ar}` : `Projects in ${city.en}`)
      : (isAr ? 'مشاريعنا' : 'Our Projects');

    const description = city
      ? (isAr
          ? `استعرض أحدث مشاريع مدائن العقارية السكنية وشقق التمليك في ${city.ar} بمعايير جودة عالية وخدمات تمويل مرنة.`
          : `Explore Madain Real Estate's latest residential projects and freehold apartments in ${city.en} with high quality standards and flexible financing.`)
      : (isAr
          ? 'مدائن العقارية شركة سعودية متخصصة في تطوير وتسويق العقارات السكنية تقدم شقق تمليك حديثة في جدة ومكة بمعايير جودة عالية .'
          : 'Madain Real Estate is a Saudi company specialized in developing and marketing residential real estate, offering modern freehold apartments in Jeddah and Makkah.');

    const url = cityKey ? `https://madain.sa/projects/${this.city}` : 'https://madain.sa/projects';

    const keywords = city
      ? (isAr
          ? `عقارات ${city.ar}, شقق تمليك ${city.ar}, مدائن العقارية, مشاريع سكنية ${city.ar}`
          : `real estate ${city.en}, freehold apartments ${city.en}, Madain Real Estate, residential projects ${city.en}`)
      : (isAr
          ? 'عقارات, شركة مدائن العقارية, شقق تمليك جدة, فلل للبيع, مشاريع سكنية, شراء شقق, عقارات جدة'
          : 'real estate, Madain Real Estate, freehold apartments Jeddah, villas for sale, residential projects, buy apartments');

    this.meta.updateTags({ title, description, url, keywords });
  }

  getProjects() {
    this._projects.getProjets().subscribe(res => {
      this.projects = res
      const all = res ?? [];

      if (!this.city) {
        this.projects = all;
        return;
      }

      if (this.city === 'makkah') {
        this.projects = all.filter(p => (p?.arLocationName ?? '').includes('مكة'));
        return;
      }

      if (this.city === 'jeddah') {
        this.projects = all.filter(p => (p?.arLocationName ?? '').includes('جدة'));
        return;
      }
      if (this.city === 'madena') {
        this.projects = all.filter(p => (p?.arLocationName ?? '').includes('المدينة'));
        return;
      }

      // لو city قيمة غريبة
      this.projects = all;
    })
  }
}
