import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QemnaComponent } from './qemna.component';

describe('QemnaComponent', () => {
  let component: QemnaComponent;
  let fixture: ComponentFixture<QemnaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QemnaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QemnaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
