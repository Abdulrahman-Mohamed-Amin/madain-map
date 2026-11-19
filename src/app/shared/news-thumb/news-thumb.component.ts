import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { News } from '../../core/interface/news';

/** صورة الخبر أو فريم من الفيديو بتاعه (مع أيقونة تشغيل) — بتستخدم في قائمة الأخبار والأخبار المقترحة */
@Component({
  selector: 'app-news-thumb',
  // البيانات حيّة من الـ API وممكن تختلف عن نسخة الـ prerender (خبر/مشروع اتضاف أو اتغير بعد الـ build).
  // من غير ده Angular بيعيد استخدام الـ HTML القديم وبيفضل فيه صور/حالات غلط، فبنرسم الجزء ده من جديد في المتصفح.
  host: { ngSkipHydration: 'true' },
  standalone: true,
  templateUrl: './news-thumb.component.html',
  styleUrl: './news-thumb.component.css'
})
export class NewsThumbComponent {
  @Input({ required: true }) news!: News;
  @Input() alt = '';
  url = environment.mediaUrl;
  /** فيديو طولي (موبايل) — بيتعرض كامل بدل ما يتقص */
  portrait = false;

  onMetadata(video: HTMLVideoElement) {
    this.portrait = video.videoHeight > video.videoWidth;
  }
}
