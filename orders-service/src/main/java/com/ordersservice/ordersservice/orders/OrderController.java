package com.ordersservice.ordersservice.orders;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
public class OrderController {
  private final OrderService orderService;
}
