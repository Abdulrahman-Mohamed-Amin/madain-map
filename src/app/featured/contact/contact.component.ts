import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import emailjs from 'emailjs-com';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MetaService } from '../../core/meta.service';
import { LanguageService } from '../../core/language.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {

  submited = false;
  isMeetingOpen = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';
  lang = 'ar';

  fb = inject(FormBuilder);

  contactForm = this.fb.group({
    name:    ['', Validators.required],
    email:   ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  get name()    { return this.contactForm.get('name');    }
  get email()   { return this.contactForm.get('email');   }
  get subject() { return this.contactForm.get('subject'); }
  get message() { return this.contactForm.get('message'); }

  meeting = new FormGroup({
    name:    new FormControl('', Validators.required),
    phone:   new FormControl('', Validators.required),
    email:   new FormControl('', [Validators.required, Validators.email]),
    purpose: new FormControl('', Validators.required),
    client:  new FormControl('', Validators.required),
    meet:    new FormControl('', Validators.required),
    date:    new FormControl('', Validators.required),
  });

  constructor(private meta: MetaService, private translate: TranslateService, private _lang: LanguageService) {
    this.meta.updateTags({
      title: 'مدائن العقارية | تواصل معنا',
      description: 'مدائن العقارية شركة سعودية متخصصة في تطوير وتسويق العقارات السكنية تقدم شقق تمليك حديثة في جدة ومكة بمعايير جودة عالية .',
      url: 'https://madain.sa/contact',
      keywords: 'عقارات, شركة مدائن العقارية, شقق تمليك جدة, فلل للبيع, مشاريع سكنية, شراء شقق, عقارات جدة',
    });
  }

  ngOnInit() {
    this._lang.currentLang$.subscribe(l => this.lang = l);
  }

  openMeetingModal()  { this.isMeetingOpen = true;  }
  closeMeetingModal() { this.isMeetingOpen = false; }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType    = type;
    setTimeout(() => { this.toastMessage = null; }, 3500);
  }

  sendEmail() {
    if (this.contactForm.invalid) { this.submited = true; return; }
    emailjs.send('service_i31g11c', 'template_bdjhwfn', this.contactForm.value, 'XaVuXfuWTEMN_kLI8')
      .then(() => {
        this.showToast(this.translate.instant('contact_sec.toastMessage'), 'success');
        this.submited = false;
        this.contactForm.reset();
      })
      .catch(() => {
        this.showToast(this.translate.instant('contact_sec.toast_error'), 'error');
      });
  }

  sendMeeting() {
    if (this.meeting.invalid) { this.meeting.markAllAsTouched(); return; }
    emailjs.send('service_i31g11c', 'template_ztnjwmo', this.meeting.value, 'XaVuXfuWTEMN_kLI8')
      .then(() => {
        this.showToast(this.translate.instant('contact_sec.toast_meeting'), 'success');
        this.meeting.reset();
        this.closeMeetingModal();
      })
      .catch(() => {
        this.showToast(this.translate.instant('contact_sec.toast_error'), 'error');
      });
  }
}
