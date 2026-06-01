import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { MetaService } from '../../core/meta.service';
import { TranslateModule } from '@ngx-translate/core';
import { ServicesService } from '../../core/services/services.service';
import { Service } from '../../core/interface/service';
import { LanguageService } from '../../core/language.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [HeaderComponent, FooterComponent , TranslateModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit{
  services:Service[] = []
  lang:string = ''
  url = environment.mediaUrl
    constructor(private meta: MetaService , private _service:ServicesService , private _lang:LanguageService ) {
      this.meta.updateTags({
        title: 'مدائن العقارية | خدمتنا',
        description:
          'مدائن العقارية شركة سعودية متخصصة في تطوير وتسويق العقارات السكنية تقدم شقق تمليك حديثة في جدة ومكة بمعايير جودة عالية .',
        url: 'https://madain.sa/services',
        keywords:
          'عقارات, شركة مدائن العقارية, شقق تمليك جدة, فلل للبيع, مشاريع سكنية, شراء شقق, عقارات جدة',
      });
    }

    ngOnInit(): void {
      this.getServices()

      this._lang.currentLang$.subscribe(res =>{
        this.lang  =res
      })
    }

    getServices(){
      this._service.getService().subscribe(res =>{
        this.services = res
      })
    }
}
