import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { News } from '../interface/news';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  url = environment.apiUrl + "News"
  constructor(private http:HttpClient) { }

  getNews(){
    return this.http.get<News[]>(this.url)
  }
}
