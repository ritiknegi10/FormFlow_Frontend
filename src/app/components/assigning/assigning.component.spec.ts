import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssigningComponent } from './assigning.component';

describe('AssigningComponent', () => {
  let component: AssigningComponent;
  let fixture: ComponentFixture<AssigningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssigningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssigningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
