import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMiscellaneousComponent } from './admin-miscellaneous.component';

describe('AdminMiscellaneousComponent', () => {
  let component: AdminMiscellaneousComponent;
  let fixture: ComponentFixture<AdminMiscellaneousComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminMiscellaneousComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMiscellaneousComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
