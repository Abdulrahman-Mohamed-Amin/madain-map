import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private _show$ = new BehaviorSubject<boolean>(false);
  readonly show$ = this._show$.asObservable();

  private minDuration = 2600;
  private showTime = 0;
  private hideTimer?: ReturnType<typeof setTimeout>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  show(minDuration = 2600) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.hideTimer) clearTimeout(this.hideTimer);
    this.minDuration = minDuration;
    this.showTime = Date.now();
    this._show$.next(true);
  }

  hide() {
    if (!isPlatformBrowser(this.platformId)) return;
    const elapsed = Date.now() - this.showTime;
    const delay = Math.max(0, this.minDuration - elapsed);
    this.hideTimer = setTimeout(() => this._show$.next(false), delay);
  }
}
