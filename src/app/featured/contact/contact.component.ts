import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../../shared/header/header.component";
import { FooterComponent } from "../../shared/footer/footer.component";
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import emailjs from 'emailjs-com';
import { TranslateModule } from '@ngx-translate/core';
import { MetaService } from '../../core/meta.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, TranslateModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {

  submited: boolean = false

  fb = inject(FormBuilder)
  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  })
  get name() {
    return this.contactForm.get('name');
  }
  get email() {
    return this.contactForm.get('email');
  }
  get subject() {
    return this.contactForm.get('subject');
  }
  get message() {
    return this.contactForm.get('message');
  }
  meeting = new FormGroup({
    name: new FormControl('', Validators.required),
    phone: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    purpose: new FormControl('', Validators.required),
    client: new FormControl('', Validators.required),
    meet: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required)
  })

  isMeetingOpen = false;
  constructor(private meta: MetaService) {
    this.meta.updateTags({
      title: 'مدائن العقارية | تواصل معنا',
      description:
        'مدائن العقارية شركة سعودية متخصصة في تطوير وتسويق العقارات السكنية تقدم شقق تمليك حديثة في جدة ومكة بمعايير جودة عالية .',
      url: 'https://madain.sa/retal',
      keywords:
        'عقارات, شركة مدائن العقارية, شقق تمليك جدة, فلل للبيع, مشاريع سكنية, شراء شقق, عقارات جدة',
    });
  }


  ngOnInit() {
  }

  openMeetingModal() {
    this.isMeetingOpen = true;
  }

  closeMeetingModal() {
    this.isMeetingOpen = false;
  }


  toastMessage: string | null = null;

  showToast(message: string) {
    this.toastMessage = message;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000); // 3 ثواني
  }

  sendEmail() {
    if (this.contactForm.invalid) {
      this.submited = true
      console.log("invalid");
      return
    }
    const formData = this.contactForm.value;

    emailjs.send(
      'service_i31g11c',
      'template_bdjhwfn',
      formData,
      'XaVuXfuWTEMN_kLI8'
    ).then(() => {
      this.showToast('تم ارسال رسالتك بنجاح ')
      this.submited = false
      this.contactForm.reset();
    }).catch(() => {
    });
  }

  sendMeeting() {
    console.log(this.meeting.value)
    if (this.meeting.valid) {
      const formData = this.meeting.value;
      emailjs.send(
        'service_i31g11c',
        'template_ztnjwmo',
        formData,
        'XaVuXfuWTEMN_kLI8'
      ).then((res) => {
        this.showToast('تم ارسال رسالتك بنجاح ')
        this.meeting.reset();

      }).catch((ERR) => {

      });
    } else {

    }
  }

}
