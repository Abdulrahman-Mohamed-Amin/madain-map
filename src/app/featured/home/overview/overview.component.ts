import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../core/language.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink , TranslateModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
constructor(private lang:LanguageService){}

getCurrent(){
  return this.lang.currentLang
}
}
