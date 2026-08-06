package com.ordersservice.ordersservice.orders.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Customer {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(nullable = false)
  private String id;

  private String fullName;
  private String street;
  private int streetNumber;
  private int postcode;
  private String city;
  private String extra;
  private String phoneNumber;
}
