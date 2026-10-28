import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Project } from '../interface/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  url = environment.apiUrl + "Project"

  // كاش داخل نفس تحميل الصفحة: أكتر من كمبوننت بينادوا نفس الـ endpoint
  // (states / projects / proj / map) فبدل عدة طلبات متطابقة نعمل طلب واحد.
  private projectsCache$?: Observable<Project[]>;
  private projectByIdCache = new Map<number, Observable<Project>>();

  constructor(private http: HttpClient) { }

  getProjets(): Observable<Project[]> {
    if (!this.projectsCache$) {
      // transferCache: false — الزائر ياخد بيانات حيّة من الـ API بدل نسخة الـ prerender القديمة
      this.projectsCache$ = this.http.get<Project[]>(this.url, { transferCache: false }).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.projectsCache$;
  }

  getProjetById(id: number): Observable<Project> {
    let cached = this.projectByIdCache.get(id);
    if (!cached) {
      cached = this.http.get<Project>(this.url + '/' + id, { transferCache: false }).pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );
      this.projectByIdCache.set(id, cached);
    }
    return cached;
  }

  /** لإجبار إعادة الجلب لو احتجنا بيانات محدّثة */
  clearCache(): void {
    this.projectsCache$ = undefined;
    this.projectByIdCache.clear();
  }
}
