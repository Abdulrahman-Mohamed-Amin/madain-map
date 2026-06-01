import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { PartnerService } from '../../core/services/partner.service';
import Swiper from 'swiper';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.css'
})
export class PartnersComponent implements OnInit{
  url = environment.mediaUrl
lang:string = ''
  swiper3?: Swiper;
swiper4?: Swiper;
  partner:any[] = []
  constructor(private _partenr:PartnerService , @Inject(PLATFORM_ID) private platformId: Object , private _lang:LanguageService){
  }

  ngOnInit(): void {
    this._lang.currentLang$.subscribe(res => {
      this.lang =res
    })
      if (isPlatformBrowser(this.platformId)) {
    
        this._partenr.get().subscribe(res =>{
          this.partner = res
    
                if (isPlatformBrowser(this.platformId)) {
                  setTimeout(() => this.initSwiper()); // بعد ما الـ DOM يتحدث
                  setTimeout(() => this.iitSwiper()); // بعد ما الـ DOM يتحدث
                }
        })
  }
  }



  initSwiper() {
    if (this.swiper3) this.swiper3.destroy(true, true);
    this.swiper3 = new Swiper('.mySwiper3', {
      spaceBetween: 20,
      breakpoints: {
        1200: { slidesPerView: 8 },
        768: { slidesPerView: 5 },
        578: { slidesPerView: 4 },
        300: { slidesPerView: 3 },
      },
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true, dynamicMainBullets: 1 },
      speed: 500,
      autoplay:{
        delay:500,
        reverseDirection:true
      },
     
    });
  }
  iitSwiper() {
    if (this.swiper4) this.swiper4.destroy(true, true);
    this.swiper4 = new Swiper('.mySwiper4', {
      spaceBetween: 20,
      breakpoints: {
        1200: { slidesPerView: 8 },
        768: { slidesPerView: 5 },
        578: { slidesPerView: 4 },
        300: { slidesPerView: 3 },
      },
      loop: true,
      pagination: { el: '.swiper-pagination', clickable: true, dynamicBullets: true, dynamicMainBullets: 1 },
      speed: 500,
      autoplay:{
        delay:500,
     
      },
     
    });
  }
}
