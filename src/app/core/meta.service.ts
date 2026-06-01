import { Injectable } from '@angular/core';
import { Meta, Title} from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  constructor(private meta: Meta, private title: Title) {}

  updateTags(config: { title: string; description:string; url?: string; keywords?: string }) {
    this.title.setTitle(config.title);
    this.meta.updateTag({ name: 'description', content: config.description });
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }
    this.meta.updateTag({ property: 'og:title', content: config.title });
    this.meta.updateTag({ property: 'og:description', content: config.description });
    if (config.url) this.meta.updateTag({ property: 'og:url', content: config.url });
  }
}
