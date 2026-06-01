import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { ServicesService } from '../../../core/services/services.service';
import { Service } from '../../../core/interface/service';
import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/language.service';

@Component({
  selector: 'app-serv',
  standalone: true,
  imports: [RouterModule, TranslateModule],
  templateUrl: './serv.component.html',
  styleUrl: './serv.component.css'
})
export class ServComponent {
  services: Service[] = []
  url = environment.mediaUrl
  lang:string = ''
  counters = [
    { value: 0, target: 28123 },
    { value: 0, target: 6086 },
    { value: 0, target: 159 }
  ];

  private started = false;
  private duration = 2000;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object, private _service: ServicesService , private _lang:LanguageService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.observeSection();
    }

    this._lang.currentLang$.subscribe(res =>{
      this.lang = res
    })
    this.getSevices()
  }

  getSevices() {
    this._service.getService().subscribe(res =>{
      this.services = res
    })
  }

  private observeSection() {
    const section = document.querySelector('.stats');
    if (!section) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.started) {
          this.started = true;
          this.animateCounters();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(section);
  }

  private animateCounters() {
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      this.counters = this.counters.map(c => ({
        ...c,
        value: Math.floor(c.target * progress)
      }));

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }

}
