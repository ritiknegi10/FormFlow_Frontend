import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedFormsComponent } from './assigned-forms.component';

describe('AssignedFormsComponent', () => {
  let component: AssignedFormsComponent;
  let fixture: ComponentFixture<AssignedFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignedFormsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
