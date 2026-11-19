import { Component, Input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { News } from '../../core/interface/news';

/** صورة الخبر أو فريم من الفيديو بتاعه (مع أيقونة تشغيل) — بتستخدم في قائمة الأخبار والأخبار المقترحة */
@Component({
  selector: 'app-news-thumb',
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
