import { Routes } from '@angular/router';

// استيراد المكونات مباشرة
import { HomeComponent } from './featured/home/home/home.component';
import { AboutComponent } from './featured/about/about.component';
import { ServicesComponent } from './featured/services/services.component';
import { ProjectsComponent } from './featured/projects/projects.component';
import { ContactComponent } from './featured/contact/contact.component';
import { ProjectDetilsComponent } from './featured/project-detils/project-detils.component';


// export const routes: Routes = [
//   { path: "", redirectTo: "home", pathMatch: "full" },
//   { path: "home", component: HomeComponent },
//   { path: "about", component: AboutComponent },
//   { path: "services", component: ServicesComponent },
//   { path: 'projects', component: ProjectsComponent },      
//   { path: 'projects/:city', component: ProjectsComponent } ,
//   { path: "contact", component: ContactComponent },
//   { path: ":slug", component: ProjectDetilsComponent },
//   { path: "**", component: HomeComponent }
// ];

export const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: "full" },

  {
    path: "home",
    loadComponent: () =>
      import("./featured/home/home/home.component").then(m => m.HomeComponent),
  },
  {
    path: "about",
    loadComponent: () =>
      import("./featured/about/about.component").then(m => m.AboutComponent),
  },
  {
    path: "services",
    loadComponent: () =>
      import("./featured/services/services.component").then(m => m.ServicesComponent),
  },
  {
    path: "projects",
    loadComponent: () =>
      import("./featured/projects-map/projects-map.component").then(m => m.ProjectsMapComponent),
  },
  {
    path: "projects/:city",
    loadComponent: () =>
      import("./featured/projects-map/projects-map.component").then(m => m.ProjectsMapComponent),
  },
  {
    path: "contact",
    loadComponent: () =>
      import("./featured/contact/contact.component").then(m => m.ContactComponent),
  },
  {
    path: ":slug/:id",
    loadComponent: () =>
      import("./featured/project-detils/project-detils.component").then(
        m => m.ProjectDetilsComponent
      ),
  },
  {
    path: "**",
    loadComponent: () =>
      import("./featured/home/home/home.component").then(m => m.HomeComponent),
  },
];