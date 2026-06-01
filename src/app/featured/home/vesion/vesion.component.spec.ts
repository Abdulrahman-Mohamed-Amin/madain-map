import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VesionComponent } from './vesion.component';

describe('VesionComponent', () => {
  let component: VesionComponent;
  let fixture: ComponentFixture<VesionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VesionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VesionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
