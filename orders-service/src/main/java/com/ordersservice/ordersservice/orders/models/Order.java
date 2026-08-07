package com.ordersservice.ordersservice.orders.models;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;


@Data
@Table(name = "takeaway-orders")
@Entity
public class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  private String id;

  private Date placedDate;
  private Date requestedTime;
  private String paymentType;
  private String orderCode;
  private double subtotal;
  private double restaurantTotal;
  private double customerTotal;
  private double deliveryFree;
  private OrderStatus status;

  @ManyToOne
  @JoinColumn(name = "customer_id")
  private Customer customer;

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
  private List<Product> products;
}
