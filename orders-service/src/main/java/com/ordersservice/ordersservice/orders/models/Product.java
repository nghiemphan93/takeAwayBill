package com.ordersservice.ordersservice.orders.models;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
public class Product {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  private String id;

  private int quantity;
  private String name;
  private double totalAmount;
  private String code;

  @OneToMany(cascade = CascadeType.ALL)
  @JoinColumn(name = "product_id")
  private List<Specification> specifications;

  @ManyToOne
  @JoinColumn(name = "order_id")
  private Order order;
}
