import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink,TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  phoneNumber:string = '920016343'
  email = 'marketing@madain.sa';
  whatsappNumber:string = '966539885590'

 openWhatsApp() {
 window.open(`https://wa.me/${this.whatsappNumber}`, "_blank");
}
  sendEmail() {
    window.location.href = `mailto:${this.email}`;
  }
  location() {
    window.open( `https://maps.app.goo.gl/oQGvU9VZ7c58Gg1U6` , "_blank")
  }

  openCall() {
    window.open(`tel:${this.phoneNumber}`, '_self');
  }
}
