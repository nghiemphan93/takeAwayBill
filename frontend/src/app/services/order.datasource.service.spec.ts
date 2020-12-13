import { TestBed } from '@angular/core/testing';

import { OrderDatasourceService } from './order.datasource.service';

describe('OrderdatasourceService', () => {
  let service: OrderDatasourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderDatasourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
