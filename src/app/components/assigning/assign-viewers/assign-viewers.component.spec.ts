import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignViewersComponent } from './assign-viewers.component';

describe('AssignViewersComponent', () => {
  let component: AssignViewersComponent;
  let fixture: ComponentFixture<AssignViewersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignViewersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignViewersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
