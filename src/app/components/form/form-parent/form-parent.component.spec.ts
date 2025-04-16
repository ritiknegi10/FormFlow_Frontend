import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormParentComponent } from './form-parent.component';

describe('FormParentComponent', () => {
  let component: FormParentComponent;
  let fixture: ComponentFixture<FormParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
