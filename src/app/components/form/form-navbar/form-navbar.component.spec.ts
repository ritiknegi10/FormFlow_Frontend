import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormNavbarComponent } from './form-navbar.component';

describe('FormNavbarComponent', () => {
  let component: FormNavbarComponent;
  let fixture: ComponentFixture<FormNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormNavbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
