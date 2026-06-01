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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LandingComponent, OverviewComponent, ServComponent, QemnaComponent, VesionComponent, FooterComponent, MadainComponent, ProjComponent, ProjecttypesComponent, StatesComponent, NewsComponent, PartnersComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  constructor(private meta:MetaService){}

  ngOnInit(): void {
    this.meta.updateTags({title:'Madain Real Estate | شركة مدائن العقارية' , description:"مدائن العقارية شركة سعودية متخصصة في تطوير وتسويق العقارات السكنية تقدم شقق تمليك حديثة في جدة ومكة بمعايير جودة عالية ." , url:"https://madain.sa/home" , keywords:"عقارات, شركة مدائن العقارية, شقق تمليك جدة, فلل للبيع, مشاريع سكنية, شراء شقق, عقارات جدة"})
  }

  
}
