package com.ordersservice.ordersservice.orders;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class OrderService {
  private final OrderRepo orderRepo;
}
