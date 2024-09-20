import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveOrderComponent } from './live-order.component';

describe('LiveOrderComponent', () => {
  let component: LiveOrderComponent;
  let fixture: ComponentFixture<LiveOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
