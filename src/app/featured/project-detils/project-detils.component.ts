import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FooterComponent } from "../../shared/footer/footer.component";
import { HeaderComponent } from "../../shared/header/header.component";
import { environment } from '../../../environments/environment';
import { Project } from '../../core/interface/project';
import { MetaService } from '../../core/meta.service';
import { ProjectsService } from '../../core/services/projects.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { LanguageService } from '../../core/language.service';
import Swiper from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
import { TranslateModule } from '@ngx-translate/core';
import { toSlug } from '../../core/utils/slug.util';


@Component({
  selector: 'app-project-detils',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, CommonModule, TranslateModule],
  templateUrl: './project-detils.component.html',
  styleUrl: './project-detils.component.css'
})
export class ProjectDetilsComponent {
  url = environment.mediaUrl
  mapUrl = ''
  project: Project | null = null
  lang: string = ''
  surfaceArea: string = ''
  groundArea: string = ''
  id: any

  countSoldUnit: any[] = []
  activeThumbIndex = 0;
  private mainSwiper?: Swiper;

  constructor(private meta: MetaService, private _project: ProjectsService, private _route: ActivatedRoute, private _lang: LanguageService, @Inject(PLATFORM_ID) private platformId: Object ) {

  }

  ngOnInit(): void {
  // this.idService.getSelectedProject().subscribe(id => {
  //   if (!id) {
  //     return;
  //   }
  //   this.id = id;
  //   this.getProject();
  // });

 this._route.paramMap.subscribe(params => {
  const id = params.get('id');

  this.id = id
 
  this.getProject()
});


    this._lang.currentLang$.subscribe(res => {
      this.lang = res
      this.updateMeta()
    })

  }

  getProject() {
    this._project.getProjetById(this.id).pipe(
      map(project => ({
        ...project,
        buildings: project.buildings.map(building => ({
          ...building,
          units: [...building.units].sort((a, b) => {
            const [aChar, aNum] = a.arTitle.split('-');
            const [bChar, bNum] = b.arTitle.split('-');
            if (+aNum !== +bNum) return +aNum - +bNum;
            return aChar.localeCompare(bChar);
          })
        }))
      }))
    ).subscribe(res => {
      this.project = res;
      this.surfaceArea = Number(res?.surfaceArea).toFixed();
      this.groundArea = Number(res?.groundArea).toFixed();
      this.getSoldUnit();
      this.updateMeta();

      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.initSlider());
      }
    });
  }

  private updateMeta(): void {
    const p = this.project;
    if (!p) return;

    const isAr = this.lang !== 'en';
    const slug = toSlug(p.enTitle) || 'project';
    const url = `https://madain.sa/${slug}/${p.id}`;
    const title = isAr ? p.arTitle : p.enTitle;
    const description = isAr
      ? (p.arDescription || `مشروع ${p.arTitle} من مدائن العقارية.`)
      : (p.enDescription || `${p.enTitle} project by Madain Real Estate.`);
    const image = p.interfaceImagePath ? this.url + p.interfaceImagePath : undefined;
    const locationName = isAr ? p.arLocationName : p.enLocationName;

    this.meta.updateTags({
      title,
      description,
      url,
      image,
      keywords: isAr
        ? `${p.arTitle}, عقارات ${locationName}, شقق تمليك ${locationName}, مدائن العقارية`
        : `${p.enTitle}, real estate ${locationName}, freehold apartments ${locationName}, Madain Real Estate`,
    });

    this.meta.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      name: isAr ? p.arTitle : p.enTitle,
      description,
      url,
      ...(image ? { image } : {}),
      address: {
        '@type': 'PostalAddress',
        addressLocality: locationName,
        addressCountry: 'SA',
      },
      ...(p.latitude && p.longitude ? {
        geo: { '@type': 'GeoCoordinates', latitude: p.latitude, longitude: p.longitude },
      } : {}),
    }, 'project-jsonld');

    this.meta.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: isAr ? 'الرئيسية' : 'Home', item: 'https://madain.sa/' },
        { '@type': 'ListItem', position: 2, name: isAr ? 'مشاريعنا' : 'Projects', item: 'https://madain.sa/projects' },
        { '@type': 'ListItem', position: 3, name: isAr ? p.arTitle : p.enTitle, item: url },
      ],
    }, 'breadcrumb-jsonld');
  }

  getSoldUnit() {
    let sold = this.project?.buildings.map(b => {
      let s = b.units.filter(u => u.isSealed).length
      this.countSoldUnit.push({ id: b.id, sold: s })
    })
  }
  initSlider(): void {
    this.mainSwiper?.destroy(true, true);

    this.mainSwiper = new Swiper('.mySwiper', {
      modules: [Navigation, Autoplay],
      slidesPerView: 1,
      loop: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      speed: 600,
      autoplay: { delay: 3500, disableOnInteraction: false },
      on: {
        slideChange: () => {
          this.activeThumbIndex = this.mainSwiper?.realIndex ?? 0;
          this.scrollThumbIntoView(this.activeThumbIndex);
        }
      }
    });
  }

  goToSlide(index: number): void {
    this.mainSwiper?.slideToLoop(index);
    this.activeThumbIndex = index;
  }

  private scrollThumbIntoView(index: number): void {
    const strip = document.querySelector('.pd-thumbs');
    const thumb = strip?.querySelectorAll('.pd-thumb')[index] as HTMLElement;
    if (thumb && strip) {
      const offset = thumb.offsetLeft - (strip as HTMLElement).clientWidth / 2 + thumb.clientWidth / 2;
      (strip as HTMLElement).scrollTo({ left: offset, behavior: 'smooth' });
    }
  }



}
