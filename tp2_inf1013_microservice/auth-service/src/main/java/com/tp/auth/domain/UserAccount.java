package com.tp.auth.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "users")
public class UserAccount {

  @Id
  @Column(length = 36, nullable = false)
  private String id;

  @Column(name = "first_name", nullable = false, length = 120)
  private String firstName;

  @Column(name = "last_name", nullable = false, length = 120)
  private String lastName;

  @Column(nullable = false, length = 30)
  private String phone;

  @Column(nullable = false, unique = true, length = 190)
  private String email;

  @Column(nullable = false, length = 255)
  private String address;

  @Column(name = "password_hash", nullable = false, length = 255)
  private String passwordHash;

  @PrePersist
  void initId() {
    if (id == null || id.isBlank()) {
      id = UUID.randomUUID().toString();
    }
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }
}

