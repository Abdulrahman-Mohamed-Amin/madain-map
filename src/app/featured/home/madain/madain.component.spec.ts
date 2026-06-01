import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MadainComponent } from './madain.component';

describe('MadainComponent', () => {
  let component: MadainComponent;
  let fixture: ComponentFixture<MadainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MadainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MadainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
