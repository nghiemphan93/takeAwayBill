package com.ordersservice.ordersservice.orders.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Specification {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  private String id;

  private String name;
  private double totalAmount;
}
