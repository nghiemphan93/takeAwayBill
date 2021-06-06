import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveOrderDetailComponent } from './live-order-detail.component';

describe('LiveOrderDetailComponent', () => {
  let component: LiveOrderDetailComponent;
  let fixture: ComponentFixture<LiveOrderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveOrderDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
