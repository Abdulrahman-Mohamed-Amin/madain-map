import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetilsComponent } from './project-detils.component';

describe('ProjectDetilsComponent', () => {
  let component: ProjectDetilsComponent;
  let fixture: ComponentFixture<ProjectDetilsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetilsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDetilsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});