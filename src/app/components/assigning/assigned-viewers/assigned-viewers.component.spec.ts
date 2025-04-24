import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedViewersComponent } from './assigned-viewers.component';

describe('AssignedViewersComponent', () => {
  let component: AssignedViewersComponent;
  let fixture: ComponentFixture<AssignedViewersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignedViewersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedViewersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
