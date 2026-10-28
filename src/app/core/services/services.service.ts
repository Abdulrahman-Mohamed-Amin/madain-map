import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Service } from '../interface/service';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  url = environment.apiUrl + 'Service'
  constructor(private http:HttpClient) { }

  getService(){
    // transferCache: false — الزائر ياخد بيانات حيّة من الـ API بدل نسخة الـ prerender القديمة
    return this.http.get<Service[]>(this.url, { transferCache: false })
  }
}
