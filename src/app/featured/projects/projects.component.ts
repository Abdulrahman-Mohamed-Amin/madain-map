import { Component, OnInit } from '@angular/core';

import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { MetaService } from '../../core/meta.service';
import { ProjComponent } from "../home/proj/proj.component";
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { log } from 'console';
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

  constructor(private meta: MetaService, private _route: ActivatedRoute, private _projects: ProjectsService , private _lang:LanguageService) {
    this.meta.updateTags({
      title: 'مدائن العقارية | مشاريعنا',
      description:
        'مدائن العقارية شركة سعودية متخصصة في تطوير وتسويق العقارات السكنية تقدم شقق تمليك حديثة في جدة ومكة بمعايير جودة عالية .',
      url: 'https://madain.sa/projects',
      keywords:
        'عقارات, شركة مدائن العقارية, شقق تمليك جدة, فلل للبيع, مشاريع سكنية, شراء شقق, عقارات جدة',
    });
  }



  ngOnInit(): void {
    this.getCity()
    this._lang.currentLang$.subscribe(res => {
      this.lang = res
    })
  }

  getCity() {
    this._route.paramMap.subscribe(res => {
      this.city = res.get('city')
      this.getProjects()
    })
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
