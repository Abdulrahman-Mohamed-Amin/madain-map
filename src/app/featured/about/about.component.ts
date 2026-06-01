import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { QemnaComponent } from "../home/qemna/qemna.component";
import { MetaService } from '../../core/meta.service';
import { TranslateModule } from '@ngx-translate/core';
import { StatesComponent } from "../home/states/states.component";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, QemnaComponent, TranslateModule, StatesComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

    constructor(private meta: MetaService) {
      this.meta.updateTags({
        title: 'مدائن العقارية | من نحن',
        description:
          'مدائن العقارية شركة سعودية متخصصة في تطوير وتسويق العقارات السكنية تقدم شقق تمليك حديثة في جدة ومكة بمعايير جودة عالية .',
        url: 'https://madain.sa/about',
        keywords:
          'عقارات, شركة مدائن العقارية, شقق تمليك جدة, فلل للبيع, مشاريع سكنية, شراء شقق, عقارات جدة',
      });
    }
}
