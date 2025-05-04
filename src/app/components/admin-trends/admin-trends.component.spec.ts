import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTrendsComponent } from './admin-trends.component';

describe('AdminTrendsComponent', () => {
  let component: AdminTrendsComponent;
  let fixture: ComponentFixture<AdminTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTrendsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
