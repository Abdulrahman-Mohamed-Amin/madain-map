import { Component, Input, OnInit } from '@angular/core';
import { Project } from '../../core/interface/project';
import { environment } from '../../../environments/environment';
import { RouterModule, Router } from '@angular/router'; // صحح هنا
import { LanguageService } from '../../core/language.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, NgClass } from "@angular/common";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [RouterModule, TranslateModule, NgClass, CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']  // صححت styleUrl لـ styleUrls
})
export class CardComponent implements OnInit {
  @Input() project?: Project
  url = environment.mediaUrl
  lang: string = ''

  constructor(
    private _lang: LanguageService,
    private router: Router   // صححت الاستيراد
  ) { }

  ngOnInit(): void {
    this._lang.currentLang$.subscribe(res => {
      this.lang = res
    })
  }

  toSlug(name: string | undefined): string {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  openProject(project: Project) {
  
    this.router.navigate(['/', this.toSlug(project.enTitle), project.id]); // استخدم this.toSlug


  }
}