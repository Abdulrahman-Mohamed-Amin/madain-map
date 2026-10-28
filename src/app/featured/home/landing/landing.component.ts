import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from "../../../shared/header/header.component";
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [HeaderComponent, TranslateModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, OnDestroy {

  heroImages = [
    'assets/hero.jpg',
    'assets/hero-photos/1.jpg',
    'assets/hero-photos/2.jpg',
    'assets/hero-photos/3.jpg',
  ];

  activeIndex = 0;
  private slideTimer?: ReturnType<typeof setInterval>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.slideTimer = setInterval(() => {
        this.activeIndex = (this.activeIndex + 1) % this.heroImages.length;
      }, 5000);
    }
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }
}
