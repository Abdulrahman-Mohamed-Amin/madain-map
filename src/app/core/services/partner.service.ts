import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  url = environment.apiUrl + "TastyMonions"
  constructor(private http:HttpClient) { }

  get(){
    return this.http.get<any>(this.url)
  }
}
