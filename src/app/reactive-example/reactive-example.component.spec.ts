import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveExampleComponent } from './reactive-example.component';

describe('ReactiveExampleComponent', () => {
  let component: ReactiveExampleComponent;
  let fixture: ComponentFixture<ReactiveExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveExampleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReactiveExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
