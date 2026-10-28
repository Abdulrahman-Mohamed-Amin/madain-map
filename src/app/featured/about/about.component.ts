import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { QemnaComponent } from "../home/qemna/qemna.component";
import { MetaService } from '../../core/meta.service';
import { TranslateModule } from '@ngx-translate/core';
import { StatesComponent } from "../home/states/states.component";
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, QemnaComponent, TranslateModule, StatesComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {

  constructor(private meta: MetaService, private _lang: LanguageService) {}

  ngOnInit(): void {
    this._lang.currentLang$.subscribe(lang => this.updateMeta(lang));
  }

  private updateMeta(lang: string): void {
    const isAr = lang === 'ar';
    this.meta.updateTags({
      title: isAr ? 'من نحن' : 'About Us',
      description: isAr
        ? 'تعرّف على شركة مدائن العقارية: رؤيتنا ورسالتنا وقيمنا وفريق العمل، وخبرتنا في تطوير وتسويق المشاريع السكنية وشقق التمليك في جدة ومكة والمدينة المنورة.'
        : 'Learn about Madain Real Estate — our vision, mission, values and team, and our experience developing and marketing residential projects and freehold apartments in Jeddah, Makkah and Madinah.',
      url: 'https://madain.sa/about',
      keywords: isAr
        ? 'عقارات, شركة مدائن العقارية, شقق تمليك جدة, فلل للبيع, مشاريع سكنية, شراء شقق, عقارات جدة'
        : 'real estate, Madain Real Estate, freehold apartments Jeddah, villas for sale, residential projects, buy apartments, Jeddah real estate',
    });
  }
}
