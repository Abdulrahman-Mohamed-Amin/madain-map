import { CommonModule, isPlatformBrowser, NgClass } from '@angular/common';
import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ProjectsService } from '../../../core/services/projects.service';
import { Project } from '../../../core/interface/project';
import { environment } from '../../../../environments/environment';
import { CardComponent } from "../../../shared/card/card.component";
Swiper.use([Navigation, Pagination, Autoplay]);

@Component({
  selector: 'app-proj',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule, CardComponent],
  templateUrl: './proj.component.html',
  styleUrl: './proj.component.css',
})
export class ProjComponent implements OnInit{
  url= environment.mediaUrl
  @Input() title = true;
  @Input() padding = true;
  projects:Project[] = []
  constructor(private _project:ProjectsService) {}

  ngOnInit(): void {
    this.getprojects()
  }

  getprojects(){
    this._project.getProjets().subscribe(res =>{
      this.projects = res.filter(p => p.projectStatusArName !== "قريبا")
    })
  }

}
