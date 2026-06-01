import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProjectsService } from '../../core/services/projects.service';
import { Project } from '../../core/interface/project';
import { LanguageService } from '../../core/language.service';
import { MetaService } from '../../core/meta.service';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';

declare var L: any;

interface Region {
  id: string;
  arName: string;
  enName: string;
  filter?: string;
  center: [number, number];
  zoom: number;
  minZoom: number;
  maxZoom: number;
  maxBounds: [[number, number], [number, number]];
  boundary?: [number, number][];
}

const REGIONS: Region[] = [
  {
    id: 'all',
    arName: 'جميع المناطق',
    enName: 'All Regions',
    center: [24.0, 45.0],
    zoom: 6,
    minZoom: 5,
    maxZoom: 18,
    maxBounds: [[15.5, 34.0], [33.0, 56.5]],
  },
  {
    id: 'jeddah',
    arName: 'جدة',
    enName: 'Jeddah',
    filter: 'جدة',
    center: [21.5433, 39.1728],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18,
    maxBounds: [[21.1, 38.7], [21.95, 39.55]],
    boundary: [
      [21.83, 39.08], [21.83, 39.22], [21.78, 39.35],
      [21.70, 39.46], [21.60, 39.52], [21.48, 39.52],
      [21.38, 39.48], [21.28, 39.40], [21.18, 39.28],
      [21.13, 39.14], [21.15, 39.04], [21.25, 39.00],
      [21.40, 38.98], [21.55, 38.98], [21.68, 39.00],
      [21.78, 39.03], [21.83, 39.08],
    ],
  },
  {
    id: 'makkah',
    arName: 'مكة المكرمة',
    enName: 'Makkah',
    filter: 'مكة',
    center: [21.3891, 39.8579],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18,
    maxBounds: [[21.0, 39.4], [21.8, 40.35]],
    boundary: [
      [21.60, 39.72], [21.62, 39.85], [21.60, 39.98],
      [21.55, 40.10], [21.47, 40.18], [21.38, 40.20],
      [21.28, 40.15], [21.20, 40.02], [21.15, 39.88],
      [21.17, 39.73], [21.24, 39.62], [21.33, 39.55],
      [21.44, 39.54], [21.54, 39.60], [21.60, 39.72],
    ],
  },
  {
    id: 'madena',
    arName: 'المدينة المنورة',
    enName: 'Al Madinah',
    filter: 'المدينة',
    center: [24.4539, 39.6142],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18,
    maxBounds: [[24.1, 39.1], [24.85, 40.1]],
    boundary: [
      [24.72, 39.45], [24.74, 39.60], [24.72, 39.75],
      [24.65, 39.87], [24.55, 39.95], [24.44, 39.97],
      [24.34, 39.90], [24.26, 39.78], [24.23, 39.62],
      [24.26, 39.47], [24.34, 39.36], [24.45, 39.30],
      [24.56, 39.33], [24.66, 39.40], [24.72, 39.45],
    ],
  },
];

const DX_DY_PRESETS = [
  { dx: 90,   dy: -80  },
  { dx: 90,   dy:  50  },
  { dx: -165, dy: -80  },
  { dx: -165, dy:  50  },
  { dx: 90,   dy: -125 },
  { dx: 90,   dy:  95  },
  { dx: -165, dy: -125 },
  { dx: -165, dy:  95  },
];

@Component({
  selector: 'app-projects-map',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './projects-map.component.html',
  styleUrl: './projects-map.component.css',
})
export class ProjectsMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private map: any = null;
  private markers = new Map<number, any>();
  private markerData: Array<{
    project: Project;
    dx: number;
    dy: number;
    isCompleted: boolean;
  }> = [];
  private labelBoxEls = new Map<number, HTMLElement>();
  private labelsDiv!: HTMLElement;
  private linesSvg!: SVGSVGElement;
  private regionRect: any = null;

  regions = REGIONS;
  selectedRegion: Region = REGIONS.find(r => r.id === 'makkah')!;
  activeFilter: 'all' | 'completed' | 'under' = 'all';
  lang = 'ar';
  mediaUrl = environment.mediaUrl;
  loading = true;
  stats = { total: 0, completed: 0, under: 0 };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private projectsService: ProjectsService,
    private langService: LanguageService,
    private route: ActivatedRoute,
    private meta: MetaService
  ) {
    this.meta.updateTags({
      title: 'مدائن العقارية | خارطة المشاريع',
      description: 'استعرض مشاريع مدائن العقارية على خارطة تفاعلية',
      url: 'https://madain.sa/projects',
      keywords: 'عقارات, مشاريع, خارطة, مدائن العقارية',
    });
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.langService.currentLang$.subscribe((l) => (this.lang = l));

    // Pre-select region from URL param if any
    this.route.paramMap.subscribe((params) => {
      const city = params.get('city');
      if (city) {
        const found = REGIONS.find((r) => r.id === city);
        if (found) this.selectedRegion = found;
      }
    });

    // جلب القائمة أولاً ثم تفاصيل كل مشروع بالتوازي للحصول على الإحداثيات
    this.projectsService.getProjets().subscribe({
      next: (list) => {
        const ids = (list ?? []).map((p) => p.id);
        forkJoin(ids.map((id) => this.projectsService.getProjetById(id))).subscribe({
          next: (details) => {
            this.loading = false;
            const withCoords = details.filter((p) => p.latitude && p.longitude);
            this.markerData = withCoords.map((p, i) => ({
              project: p,
              ...DX_DY_PRESETS[i % DX_DY_PRESETS.length],
              isCompleted: this.checkCompleted(p),
            }));
            this.updateStats();
            setTimeout(() => this.initMap(), 60);
          },
          error: () => {
            this.loading = false;
            setTimeout(() => this.initMap(), 60);
          },
        });
      },
      error: () => {
        this.loading = false;
        setTimeout(() => this.initMap(), 60);
      },
    });
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  // ─── helpers ───────────────────────────────────────────────────────────────

  checkCompleted(p: Project): boolean {
    return (
      (p.projectStatusArName ?? '').includes('منجز') ||
      (p.projectStatusEnName ?? '').toLowerCase().includes('complet') ||
      p.projectStatusId === 1
    );
  }

  visibleIds(): Set<number> {
    return new Set(
      this.markerData
        .filter(({ project: p, isCompleted }) => {
          if (
            this.selectedRegion.filter &&
            !(p.arLocationName ?? '').includes(this.selectedRegion.filter)
          )
            return false;
          if (this.activeFilter === 'completed' && !isCompleted) return false;
          if (this.activeFilter === 'under' && isCompleted) return false;
          return true;
        })
        .map(({ project }) => project.id)
    );
  }

  updateStats() {
    this.stats = {
      total: this.markerData.length,
      completed: this.markerData.filter((d) => d.isCompleted).length,
      under: this.markerData.filter((d) => !d.isCompleted).length,
    };
  }

  toSlug(name: string | undefined) {
    return (name ?? '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  // ─── map init ──────────────────────────────────────────────────────────────

  initMap() {
    if (!isPlatformBrowser(this.platformId) || typeof L === 'undefined') return;
    const r = this.selectedRegion;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: r.center,
      zoom: r.zoom,
      minZoom: r.minZoom,
      maxZoom: r.maxZoom,
      maxBounds: r.maxBounds,
      maxBoundsViscosity: 0.85,
      zoomControl: false,
      attributionControl: false,
    });

    // Satellite base layer
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19 }
    ).addTo(this.map);

    // Labels layer
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, subdomains: 'abcd' }
    ).addTo(this.map);

    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.buildLabelsOverlay();
    this.addAllMarkers();
    this.drawRegionRect();

    this.map.on('move zoom moveend zoomend viewreset', () =>
      this.redrawLabels()
    );
    this.map.whenReady(() => setTimeout(() => this.redrawLabels(), 120));
  }

  buildLabelsOverlay() {
    // createPane يضع الـ div داخل leaflet-map-pane:
    // z-index 680 = فوق markers (600) وتحت popup (700)
    this.map.createPane('labelsPane');
    const pane = this.map.getPane('labelsPane') as HTMLElement;
    pane.style.zIndex = '680';
    pane.style.pointerEvents = 'none';
    pane.style.overflow = 'visible';
    this.labelsDiv = pane;

    const ns = 'http://www.w3.org/2000/svg';
    this.linesSvg = document.createElementNS(ns, 'svg') as SVGSVGElement;
    this.linesSvg.style.cssText = 'position:absolute;pointer-events:none;';
    pane.appendChild(this.linesSvg);
  }

  addAllMarkers() {
    this.markerData.forEach(({ project, isCompleted }) => {
      const color = isCompleted ? '#22c55e' : '#f97316';
      const marker = L.circleMarker([project.latitude, project.longitude], {
        radius: 9,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      });
      marker.on('click', () => this.openPopup(project, isCompleted));
      marker.addTo(this.map);
      this.markers.set(project.id, marker);

      const box = this.buildLabelBox(project, isCompleted);
      box.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openPopup(project, isCompleted);
      });
      L.DomEvent.disableClickPropagation(box);
      this.labelsDiv.appendChild(box);
      this.labelBoxEls.set(project.id, box);
    });
  }

  buildLabelBox(project: Project, isCompleted: boolean): HTMLElement {
    const color = isCompleted ? '#22c55e' : '#f97316';
    const box = document.createElement('div');
    box.style.cssText =
      'position:absolute;width:140px;background:#fff;border-radius:5px;overflow:hidden;' +
      'box-shadow:0 3px 12px rgba(0,0,0,0.4);cursor:pointer;pointer-events:all;display:none;';

    const bar = document.createElement('div');
    bar.style.cssText = `height:4px;background:${color};`;

    const body = document.createElement('div');
    body.style.cssText = 'padding:6px 8px;';

    const nm = document.createElement('div');
    nm.style.cssText =
      'font-size:16px;font-weight:700;color:#003748;line-height:1.4;font-family:"El Messiri",sans-serif;';
    nm.textContent =
      this.lang === 'ar' ? project.arTitle : project.enTitle;

    const lc = document.createElement('div');
    lc.style.cssText =
      'font-size:10px;color:#888;margin-top:2px;font-family:"El Messiri",sans-serif;';
    lc.textContent =
      this.lang === 'ar' ? project.arLocationName : project.enLocationName;

    body.appendChild(nm);
    body.appendChild(lc);
    box.appendChild(bar);
    box.appendChild(body);
    return box;
  }

  // ─── events ────────────────────────────────────────────────────────────────

  onRegionChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedRegion = REGIONS.find((r) => r.id === id) ?? REGIONS[0];
    this.updateStats();

    if (!this.map) return;
    const r = this.selectedRegion;
    this.map.setMinZoom(r.minZoom);
    this.map.setMaxZoom(r.maxZoom);
    this.map.setMaxBounds(r.maxBounds);
    this.map.flyTo(r.center, r.zoom, { duration: 1.2 });
    this.drawRegionRect();
    this.syncMarkerVisibility();
  }

  setFilter(f: 'all' | 'completed' | 'under') {
    this.activeFilter = f;
    this.syncMarkerVisibility();
  }

  // ─── draw helpers ──────────────────────────────────────────────────────────

  syncMarkerVisibility() {
    if (!this.map) return;
    const visible = this.visibleIds();
    this.markerData.forEach(({ project }) => {
      const marker = this.markers.get(project.id);
      const box = this.labelBoxEls.get(project.id);
      if (visible.has(project.id)) {
        if (marker && !this.map.hasLayer(marker)) marker.addTo(this.map);
      } else {
        if (marker && this.map.hasLayer(marker)) this.map.removeLayer(marker);
        if (box) box.style.display = 'none';
      }
    });
    this.redrawLabels();
  }

  drawRegionRect() {
    if (!this.map) return;
    if (this.regionRect) {
      this.map.removeLayer(this.regionRect);
      this.regionRect = null;
    }
    const r = this.selectedRegion;
    if (r.id !== 'all' && r.boundary) {
      this.regionRect = L.polygon(r.boundary, {
        color: '#CE8C5B',
        weight: 2,
        dashArray: '10 6',
        fill: true,
        fillColor: '#CE8C5B',
        fillOpacity: 0.06,
        interactive: false,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(this.map);
    }
  }

  redrawLabels() {
    if (!this.map || !this.linesSvg) return;

    while (this.linesSvg.firstChild)
      this.linesSvg.removeChild(this.linesSvg.firstChild);

    const zoom = this.map.getZoom();
    const showBoxes = zoom >= 11;
    const visible = this.visibleIds();
    const ns = 'http://www.w3.org/2000/svg';

    // offset لتحويل container coords إلى pane-relative coords
    const panePos = L.DomUtil.getPosition(this.map.getPanes().mapPane);

    // ── ضبط الـ SVG ليغطي الـ viewport كاملاً ──────────────
    const size = this.map.getSize();
    const P = 300;
    const svgL = -panePos.x - P;
    const svgT = -panePos.y - P;
    const svgW = size.x + P * 2;
    const svgH = size.y + P * 2;
    this.linesSvg.style.left = svgL + 'px';
    this.linesSvg.style.top  = svgT + 'px';
    this.linesSvg.setAttribute('width',   String(svgW));
    this.linesSvg.setAttribute('height',  String(svgH));
    this.linesSvg.setAttribute('viewBox', `${svgL} ${svgT} ${svgW} ${svgH}`);

    // كلما zoom أكبر = البوكس أبعد قليلاً، zoom أصغر = أقرب للنقطة
    const zScale = Math.max(0.45, Math.min(1, (zoom - 10) / 3.5));
    // الحد الأقصى للدفع حتى لا يبتعد البوكس عن النقطة
    const MAX_PUSH = 90;

    // ── Step 1: حساب المواضع الأولية ────────────────────────
    type Item = {
      id: number; dx: number;
      px: number; py: number;
      bx: number; by: number;
      anchorY: number;
    };
    const items: Item[] = [];

    this.markerData.forEach(({ project, dx, dy }) => {
      if (!visible.has(project.id)) return;
      const cpt = this.map.latLngToContainerPoint([project.latitude, project.longitude]);
      const px  = cpt.x - panePos.x;
      const py  = cpt.y - panePos.y;
      const initBy = py + dy * zScale;
      items.push({ id: project.id, dx, px, py, bx: px + dx * zScale, by: initBy, anchorY: initBy });
    });

    // ── Step 2: فصل البوكسات بحد أقصى MAX_PUSH ──────────────
    if (showBoxes && items.length > 1) {
      const BW = 148, BH = 46, GAP = 8;
      for (let iter = 0; iter < 80; iter++) {
        let moved = false;
        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const a = items[i], b = items[j];
            const xOvlp = Math.min(a.bx + BW, b.bx + BW) - Math.max(a.bx, b.bx);
            const yOvlp = Math.min(a.by + BH + GAP, b.by + BH + GAP) - Math.max(a.by, b.by);
            if (xOvlp > 4 && yOvlp > 0) {
              const push = yOvlp / 2 + 1;
              if (a.by <= b.by) {
                if (Math.abs(a.by - push - a.anchorY) < MAX_PUSH) { a.by -= push; moved = true; }
                if (Math.abs(b.by + push - b.anchorY) < MAX_PUSH) { b.by += push; moved = true; }
              } else {
                if (Math.abs(a.by + push - a.anchorY) < MAX_PUSH) { a.by += push; moved = true; }
                if (Math.abs(b.by - push - b.anchorY) < MAX_PUSH) { b.by -= push; moved = true; }
              }
            }
          }
        }
        if (!moved) break;
      }
    }

    // ── Step 3: رسم ─────────────────────────────────────────
    items.forEach(({ id, dx, px, py, bx, by }) => {
      const box = this.labelBoxEls.get(id);
      if (!box) return;

      box.style.left = bx + 'px';
      box.style.top  = by + 'px';
      box.style.display = showBoxes ? 'block' : 'none';

      if (!showBoxes) return;

      const toRight  = dx > 0;
      const cornerX  = toRight ? bx : bx + 140;
      const boxMidY  = by + 14;

      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', `M ${px} ${py} H ${cornerX} V ${boxMidY}`);
      path.setAttribute('stroke', '#ffffff');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-opacity', '0.85');
      path.setAttribute('stroke-linecap', 'round');
      this.linesSvg.appendChild(path);
    });
  }

  openPopup(project: Project, isCompleted: boolean) {
    if (!this.map) return;
    const color = isCompleted ? '#22c55e' : '#f97316';
    const name = this.lang === 'ar' ? project.arTitle : project.enTitle;
    const loc =
      this.lang === 'ar' ? project.arLocationName : project.enLocationName;
    const status =
      this.lang === 'ar'
        ? project.projectStatusArName
        : project.projectStatusEnName;
    const imgSrc = project.interfaceImagePath
      ? this.mediaUrl + project.interfaceImagePath
      : null;
    const slug = this.toSlug(project.enTitle);
    const dir = this.lang === 'ar' ? 'rtl' : 'ltr';

    const html = `
      <div style="width:250px;font-family:'El Messiri',sans-serif;direction:${dir};">
        ${imgSrc ? `<img src="${imgSrc}" loading="lazy" style="width:100%;height:140px;object-fit:cover;border-radius:5px;margin-bottom:10px;" />` : ''}
        <h3 style="font-size:14px;color:#003748;margin:0 0 4px;font-weight:700;">${name}</h3>
        <p style="font-size:12px;color:#666;margin:0 0 8px;">📍 ${loc}</p>
        <span style="background:${color};color:#fff;font-size:10px;padding:2px 10px;border-radius:10px;">${status ?? ''}</span>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;">
          <div style="background:#f5f6f9;border-radius:5px;padding:7px;text-align:center;">
            <div style="font-size:10px;color:#888;">${this.lang === 'ar' ? 'الوحدات' : 'Units'}</div>
            <div style="font-size:15px;font-weight:700;color:#003748;">${project.unitsCount ?? '—'}</div>
          </div>
          <div style="background:#f5f6f9;border-radius:5px;padding:7px;text-align:center;">
            <div style="font-size:10px;color:#888;">${this.lang === 'ar' ? 'المباني' : 'Buildings'}</div>
            <div style="font-size:15px;font-weight:700;color:#003748;">${project.buildingCount ?? '—'}</div>
          </div>
          <div style="background:#f5f6f9;border-radius:5px;padding:7px;text-align:center;">
            <div style="font-size:10px;color:#888;">${this.lang === 'ar' ? 'المساحة' : 'Area'}</div>
            <div style="font-size:13px;font-weight:700;color:#003748;">${project.groundArea ?? '—'}</div>
          </div>
          <div style="background:#f5f6f9;border-radius:5px;padding:7px;text-align:center;">
            <div style="font-size:10px;color:#888;">${this.lang === 'ar' ? 'الحالة' : 'Status'}</div>
            <div style="font-size:11px;font-weight:700;color:${color};">${status ?? '—'}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <a href="/${slug}/${project.id}" style="flex:1;background:#003748;color:#fff;text-align:center;padding:8px 4px;border-radius:20px;font-size:11px;text-decoration:none;display:block;">
            ${this.lang === 'ar' ? 'تفاصيل المشروع' : 'View Project'}
          </a>
          <a href="${project.locationUrl?.startsWith('http') ? project.locationUrl : `https://www.google.com/maps?q=${project.latitude},${project.longitude}`}" target="_blank" rel="noopener" style="flex:1;background:#CE8C5B;color:#fff;text-align:center;padding:8px 4px;border-radius:20px;font-size:11px;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:4px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            ${this.lang === 'ar' ? 'خريطة قوقل' : 'Google Maps'}
          </a>
        </div>
      </div>`;

    L.popup({ maxWidth: 280, className: 'madain-popup' })
      .setLatLng([project.latitude, project.longitude])
      .setContent(html)
      .openOn(this.map);
  }
}
