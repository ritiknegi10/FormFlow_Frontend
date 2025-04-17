import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormVersionsComponent } from './form-versions.component';

describe('FormVersionsComponent', () => {
  let component: FormVersionsComponent;
  let fixture: ComponentFixture<FormVersionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormVersionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
