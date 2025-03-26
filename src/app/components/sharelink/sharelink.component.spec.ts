import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharelinkComponent } from './sharelink.component';

describe('SharelinkComponent', () => {
  let component: SharelinkComponent;
  let fixture: ComponentFixture<SharelinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharelinkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharelinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
