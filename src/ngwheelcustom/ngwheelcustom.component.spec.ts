import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgwheelcustomComponent } from './ngwheelcustom.component';

describe('NgwheelcustomComponent', () => {
  let component: NgwheelcustomComponent;
  let fixture: ComponentFixture<NgwheelcustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgwheelcustomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgwheelcustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
