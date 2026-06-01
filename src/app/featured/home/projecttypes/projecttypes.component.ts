import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-projecttypes',
  standalone: true,
  imports: [RouterModule , TranslateModule],
  templateUrl: './projecttypes.component.html',
  styleUrl: './projecttypes.component.css'
})
export class ProjecttypesComponent {

  constructor(){}
}
