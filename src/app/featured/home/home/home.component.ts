import { Component, OnInit } from '@angular/core';
import { LandingComponent } from "../landing/landing.component";
import { OverviewComponent } from "../overview/overview.component";
import { ProjectsComponent } from "../../projects/projects.component";
import { ServComponent } from "../serv/serv.component";
import { QemnaComponent } from "../qemna/qemna.component";
import { VesionComponent } from "../vesion/vesion.component";
import { FooterComponent } from "../../../shared/footer/footer.component";
import { MadainComponent } from "../madain/madain.component";
import { ProjComponent } from "../proj/proj.component";
import { MetaService } from '../../../core/meta.service';
import { ProjecttypesComponent } from "../projecttypes/projecttypes.component";
import { StatesComponent } from "../states/states.component";
import { NewsComponent } from "../news/news.component";
import { PartnersComponent } from "../../partners/partners.component";
import { LanguageService } from '../../../core/language.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LandingComponent, OverviewComponent, ServComponent, QemnaComponent, VesionComponent, FooterComponent, MadainComponent, ProjComponent, ProjecttypesComponent, StatesComponent, NewsComponent, PartnersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  constructor(private meta: MetaService, private _lang: LanguageService) {}

  ngOnInit(): void {
    this._lang.currentLang$.subscribe(lang => this.updateMeta(lang));
  }

  private updateMeta(lang: string): void {
    const isAr = lang === 'ar';
    this.meta.updateTags({
      homePage: true,
      title: '',
      description: isAr
        ? 'مدائن العقارية شركة سعودية متخصصة في تطوير وتسويق العقارات السكنية تقدم شقق تمليك حديثة في جدة ومكة بمعايير جودة عالية .'
        : 'Madain Real Estate is a Saudi company specialized in developing and marketing residential real estate, offering modern freehold apartments in Jeddah and Makkah.',
      url: 'https://madain.sa/',
      keywords: isAr
        ? 'عقارات, شركة مدائن العقارية, شقق تمليك جدة, فلل للبيع, مشاريع سكنية, شراء شقق, عقارات جدة'
        : 'real estate, Madain Real Estate, freehold apartments Jeddah, villas for sale, residential projects, buy apartments, Jeddah real estate',
    });
  }
}
