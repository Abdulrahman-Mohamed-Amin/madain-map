import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MetaService } from '../../core/meta.service';

const ENDPOINT = 'https://script.google.com/macros/s/AKfycbzXZbay7OsjH1BZJvEk0RIvzq0qL8gNWSZ9L2d1xuydy771WTLNPLzmjdqJDxJ6SlRe/exec';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTHER = 'أخرى';
const PERSONAL_FIELDS = ['full_name', 'phone', 'email', 'city'];
const REQUIRED_FIELDS = [...PERSONAL_FIELDS];
const MULTI_FIELDS = ['regions', 'property_types', 'client_segments', 'channels'] as const;
type MultiField = (typeof MULTI_FIELDS)[number];
const OTHER_KEYS = {
  regions: 'regions_other',
  property_types: 'property_types_other',
  client_segments: 'client_segments_other',
  channels: 'channels_other',
} as const;
type DupField = 'phone' | 'email';

const DUP_MSG: Record<DupField, string> = {
  phone: 'رقم الجوال هذا مسجّل لدينا من قبل.',
  email: 'البريد الإلكتروني هذا مسجّل لدينا من قبل.',
};

function normalizePhone(v: string): string {
  let d = (v || '').replace(/\D/g, '');
  if (d.startsWith('966')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return d;
}

function freshForm() {
  return {
    full_name: '', phone: '', email: '', city: '', job_title: '', preferred_language: '',
    profile: '', profile_other: '', experience_years: '',
    regions: [] as string[], regions_other: '',
    property_types: [] as string[], property_types_other: '',
    works_at_company: '', company_name: '', cr_number: '', fal_license: '', company_links: '',
    clients_count: '', monthly_sales: '',
    client_segments: [] as string[], client_segments_other: '',
    current_developers: '',
    channels: [] as string[], channels_other: '',
    has_client_database: '', sales_team: '', site_visits: '',
  };
}

@Component({
  selector: 'app-brokers',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './brokers.component.html',
  styleUrl: './brokers.component.css',
})
export class BrokersComponent implements OnInit {
  readonly OTHER = OTHER;

  readonly preferredLanguages = ['العربية', 'الإنجليزية', 'كلاهما'];
  readonly profiles = ['وسيط عقاري مستقل', 'مسوق / وكيل عقاري', 'أعمل لدى شركة وساطة عقارية', 'شركة وساطة عقارية', 'مسوق عقاري', 'مستشار عقاري / استثماري', OTHER];
  readonly experienceYears = ['أقل من سنة', 'من سنة إلى 3 سنوات', 'من 3 إلى 5 سنوات', 'أكثر من 5 سنوات'];
  readonly regionOptions = ['مكة المكرمة', 'المدينة المنورة', 'جدة'];
  readonly propertyTypeOptions = ['مشاريع على الخارطة', 'عقارات جاهزة', 'عقارات سكنية', 'عقارات تجارية', 'أراضٍ', 'ضيافة', OTHER];
  readonly yesNo = ['نعم', 'لا'];
  readonly clientsCounts = ['من 1 إلى 10', 'من 11 إلى 25', 'من 26 إلى 50', 'من 51 إلى 100', 'أكثر من 100'];
  readonly monthlySales = ['0–1', '2–3', '4–5', '6–10', 'أكثر من 10'];
  readonly clientSegmentOptions = ['مستخدمون نهائيون', 'مستثمرون', 'عملاء من داخل المملكة', 'عملاء من دول الخليج', 'عملاء دوليون', 'عملاء من ذوي الملاءة المالية العالية', OTHER];
  readonly channelOptions = ['الواتساب', 'إنستغرام', 'سناب شات', 'تيك توك', 'لينكدإن', 'منصات العقارات', 'قاعدة بيانات العملاء الخاصة بي', 'الإحالات والتوصيات', "الكل"];
  readonly salesTeamOptions = ['نعم', 'لا، أعمل بشكل مستقل', 'أعمل ضمن فريق / شركة'];
  readonly siteVisitOptions = ['نعم', 'لا', 'حسب المشروع'];

  readonly stepCount = 4;
  form = freshForm();
  step = 0;
  errors: Partial<Record<string, string>> = {};
  checking = false;
  submitting = false;
  submitted = false;

  constructor(
    private meta: MetaService,
    private host: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private doc: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    this.meta.updateTags({
      title: 'شراكة الوسطاء',
      description: 'انضم إلى شبكة وسطاء ومسوّقي مدائن العقارية لتسويق وبيع مشاريعنا في مختلف مناطق المملكة. سجّل اهتمامك وسيتواصل معك فريقنا.',
      url: 'https://madain.sa/brokers',
      image: 'https://res.cloudinary.com/drvtf0l8n/image/upload/c_fill,g_center,w_1200,h_630,q_auto:good,f_jpg/v1762350527/3_vwwi9w.jpg',
      imageWidth: 1200,
      imageHeight: 630,
      imageAlt: 'مبنى من مشاريع مدائن العقارية',
      noindex: true,
    });
  }

  get companyYes(): boolean {
    return this.form.works_at_company === 'نعم';
  }

  get stepFill(): string {
    return ((this.step + 1) / this.stepCount) * 100 + '%';
  }

  get isLastStep(): boolean {
    return this.step === this.stepCount - 1;
  }

  showOther(name: 'profile' | MultiField): boolean {
    return name === 'profile' ? this.form.profile === OTHER : this.form[name].includes(OTHER);
  }

  multiLabel(name: MultiField): string {
    const picked = this.form[name];
    return picked.length ? picked.join('، ') : 'اختر…';
  }

  toggleMulti(name: MultiField, value: string, checked: boolean): void {
    const list = this.form[name];
    const idx = list.indexOf(value);
    if (checked && idx === -1) list.push(value);
    if (!checked && idx > -1) list.splice(idx, 1);
    this.clearError(name);
  }

  onCompanyChange(): void {
    this.clearError('works_at_company');
    if (this.companyYes) return;
    this.form.company_name = '';
    this.form.cr_number = '';
    this.form.fal_license = '';
    this.form.company_links = '';
  }

  clearError(name: string): void {
    if (this.errors[name]) this.errors = { ...this.errors, [name]: undefined };
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    this.host.nativeElement.querySelectorAll<HTMLDetailsElement>('details.multi[open]').forEach(d => {
      if (!d.contains(target as Node)) d.open = false;
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.host.nativeElement.querySelectorAll<HTMLDetailsElement>('details.multi[open]').forEach(d => {
      d.open = false;
      d.querySelector('summary')?.focus();
    });
  }

  async next(): Promise<void> {
    if (this.step === 0) {
      if (this.validate(PERSONAL_FIELDS)) return;
      if (await this.blockIfDuplicate()) return;
    }
    this.goTo(this.step + 1);
  }

  prev(): void {
    this.goTo(this.step - 1);
  }

  async submit(): Promise<void> {
    const bad = this.validate(REQUIRED_FIELDS);
    if (bad) {
      if (PERSONAL_FIELDS.includes(bad)) this.goTo(0, false);
      return;
    }
    if (await this.blockIfDuplicate()) return;

    this.submitting = true;
    try {
      await fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: this.buildPayload() });
      this.submitted = true;
      this.scrollTop();
    } catch {
      alert('تعذّر إرسال النموذج، يرجى المحاولة مرة أخرى.');
    } finally {
      this.submitting = false;
    }
  }

  restart(): void {
    this.form = freshForm();
    this.errors = {};
    this.step = 0;
    this.submitted = false;
    this.scrollTop();
  }

  private goTo(i: number, scroll = true): void {
    this.step = Math.max(0, Math.min(i, this.stepCount - 1));
    if (scroll) this.scrollTop();
  }

  private scrollTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.host.nativeElement.querySelector('.container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private collectErrors(): Record<string, string> {
    const f = this.form;
    const e: Record<string, string> = {};
    const phone = normalizePhone(f.phone);
    if (!f.full_name.trim()) e['full_name'] = 'يرجى إدخال الاسم الكامل.';
    if (!f.phone.trim()) e['phone'] = 'يرجى إدخال رقم الجوال.';
    else if (!/^5\d{8}$/.test(phone)) e['phone'] = 'رقم الجوال غير صحيح. مثال: 5XXXXXXXX';
    if (!f.email.trim()) e['email'] = 'يرجى إدخال البريد الإلكتروني.';
    else if (!EMAIL_RE.test(f.email.trim())) e['email'] = 'صيغة البريد الإلكتروني غير صحيحة.';
    if (!f.city.trim()) e['city'] = 'يرجى إدخال المدينة.';
    return e;
  }

  /** يرجّع أول حقل فيه خطأ من الأسماء المطلوبة، أو null */
  private validate(names: string[]): string | null {
    const all = this.collectErrors();
    const next = { ...this.errors };
    for (const n of names) {
      delete next[n];
      if (all[n]) next[n] = all[n];
    }
    this.errors = next;
    const first = names.find(n => all[n]) ?? null;
    if (first) this.focusField(first);
    return first;
  }

  private focusField(name: string): void {
    setTimeout(() => {
      const el = this.host.nativeElement.querySelector<HTMLElement>(`[data-field="${name}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.querySelector<HTMLElement>('input, textarea, select, summary')?.focus({ preventScroll: true });
    });
  }

  private async blockIfDuplicate(): Promise<boolean> {
    this.checking = true;
    const dup = await this.checkDuplicate();
    this.checking = false;
    if (!dup) return false;
    this.goTo(0, false);
    this.errors = { ...this.errors, [dup]: DUP_MSG[dup] };
    this.focusField(dup);
    return true;
  }

  /** يسأل Google Sheet إن كان الجوال أو البريد مسجّلًا من قبل (JSONP) */
  private checkDuplicate(): Promise<DupField | ''> {
    return new Promise(resolve => {
      if (!isPlatformBrowser(this.platformId)) return resolve('');
      const win = this.doc.defaultView as unknown as Record<string, unknown>;
      const cb = 'dupCheck_' + Date.now();
      const s = this.doc.createElement('script');
      let finished = false;
      const done = (val: DupField | '') => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        delete win[cb];
        s.remove();
        resolve(val);
      };
      const timer = setTimeout(() => done(''), 8000);
      win[cb] = (res: { duplicate?: DupField | '' } | null) => done((res && res.duplicate) || '');
      s.onload = () => done('');
      s.onerror = () => done('');
      s.src = ENDPOINT + '?action=check&callback=' + cb
        + '&phone=' + encodeURIComponent('+966' + normalizePhone(this.form.phone))
        + '&email=' + encodeURIComponent(this.form.email.trim());
      this.doc.head.appendChild(s);
    });
  }

  private buildPayload(): URLSearchParams {
    const f = this.form;
    const p = new URLSearchParams();
    const text: Record<string, string> = {
      full_name: f.full_name.trim(),
      phone: '+966' + normalizePhone(f.phone),
      email: f.email.trim(),
      city: f.city.trim(),
      job_title: f.job_title.trim(),
      preferred_language: f.preferred_language,
      experience_years: f.experience_years,
      works_at_company: f.works_at_company,
      company_name: f.company_name.trim(),
      cr_number: f.cr_number.trim(),
      fal_license: f.fal_license.trim(),
      company_links: f.company_links.trim(),
      clients_count: f.clients_count,
      monthly_sales: f.monthly_sales,
      current_developers: f.current_developers.trim(),
      has_client_database: f.has_client_database,
      sales_team: f.sales_team,
      site_visits: f.site_visits,
    };
    for (const [k, v] of Object.entries(text)) p.append(k, v);

    p.append('profile', f.profile);
    if (this.showOther('profile')) p.append('profile_other', f.profile_other.trim());

    for (const name of MULTI_FIELDS) {
      f[name].forEach(v => p.append(name, v));
      if (this.showOther(name)) p.append(OTHER_KEYS[name], this.otherText(name));
    }

    return p;
  }

  private otherText(name: MultiField): string {
    return this.form[OTHER_KEYS[name]].trim();
  }
}
