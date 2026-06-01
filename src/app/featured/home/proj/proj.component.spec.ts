import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjComponent } from './proj.component';

describe('ProjComponent', () => {
  let component: ProjComponent;
  let fixture: ComponentFixture<ProjComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
