import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Project } from '../interface/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  url = environment.apiUrl + "Project"
  constructor(private http: HttpClient) { }

  getProjets() {
    return this.http.get<Project[]>(this.url)
  }
  getProjetById(id:number) {
    return this.http.get<Project>(this.url +'/' +id)
  }

}
