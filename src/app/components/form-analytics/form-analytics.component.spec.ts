import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAnalyticsComponent } from './form-analytics.component';

describe('FormAnalyticsComponent', () => {
  let component: FormAnalyticsComponent;
  let fixture: ComponentFixture<FormAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
