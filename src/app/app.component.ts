import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, RouterModule , Router, Scroll } from '@angular/router';
import * as AOS from 'aos';
import { filter } from 'rxjs';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  title = 'madain';


   constructor(
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // شغّل AOS فقط في المتصفح (خصوصاً لو عندك SSR)
    if (!isPlatformBrowser(this.platformId)) return;

    // تهيئة أولية
    AOS.init({
      duration: 1200,
      once: true
    });

    // الطريقة المفضّلة: استمع لأحداث Scroll من الراوتر (تضمن أن استعادة الـ scroll اكتملت)
    this.router.events.pipe(
      filter(e => e instanceof Scroll)
    ).subscribe((e: Scroll) => {
      // ننتظر الإطار التالي بعد انتهاء الـ scroll/layout ثم نعيد حساب AOS
      // استخدام requestAnimationFrame مرتين يضمن أن DOM قد استقر
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          AOS.refresh(); // أخفّ من refreshHard
        });
      });
    });

    // دعم احتياطي: لو لم تعمل Scroll events لأي سبب، نستخدم NavigationEnd كبديل
    
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      // لو أنت تريد إجبار الصفحة للفوق:
      window.scrollTo(0, 0);

      // ننتظر قليلًا ثم نحدّث AOS
      setTimeout(() => {
        AOS.refresh();
      }, 3000);
    });
  }
   

}
