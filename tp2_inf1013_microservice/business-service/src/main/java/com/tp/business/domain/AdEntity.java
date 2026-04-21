package com.tp.business.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "ads")
public class AdEntity {

  @Id
  @Column(length = 80, nullable = false)
  private String id;

  @Column(nullable = false, length = 180)
  private String title;

  @Column(name = "short_description", nullable = false, length = 240)
  private String shortDescription;

  @Column(name = "long_description", nullable = false, length = 4000)
  private String longDescription;

  @Column(name = "monthly_rent", nullable = false)
  private Integer monthlyRent;

  @Column(name = "available_from", nullable = false, length = 40)
  private String availableFrom;

  @Column(name = "photos_text", nullable = false, length = 4000)
  private String photosText;

  @Column(name = "location_address", nullable = false, length = 500)
  private String locationAddress;

  @Column(length = 255)
  private String street;

  @Column(length = 120)
  private String city;

  @Column(name = "postal_code", length = 30)
  private String postalCode;

  @Column(name = "street_address", length = 500)
  private String streetAddress;

  @Column(name = "owner_id", nullable = false, length = 80)
  private String ownerId;

  @Column(name = "is_active", nullable = false)
  private Boolean isActive;

  @Column(nullable = false)
  private Integer views;

  @PrePersist
  void initDefaults() {
    if (id == null || id.isBlank()) {
      id = "ad-" + UUID.randomUUID();
    }
    if (isActive == null) {
      isActive = true;
    }
    if (views == null) {
      views = 0;
    }
    if (photosText == null || photosText.isBlank()) {
      photosText = "assets/images/placeholder.svg";
    }
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getShortDescription() {
    return shortDescription;
  }

  public void setShortDescription(String shortDescription) {
    this.shortDescription = shortDescription;
  }

  public String getLongDescription() {
    return longDescription;
  }

  public void setLongDescription(String longDescription) {
    this.longDescription = longDescription;
  }

  public Integer getMonthlyRent() {
    return monthlyRent;
  }

  public void setMonthlyRent(Integer monthlyRent) {
    this.monthlyRent = monthlyRent;
  }

  public String getAvailableFrom() {
    return availableFrom;
  }

  public void setAvailableFrom(String availableFrom) {
    this.availableFrom = availableFrom;
  }

  public String getPhotosText() {
    return photosText;
  }

  public void setPhotosText(String photosText) {
    this.photosText = photosText;
  }

  public String getLocationAddress() {
    return locationAddress;
  }

  public void setLocationAddress(String locationAddress) {
    this.locationAddress = locationAddress;
  }

  public String getStreet() {
    return street;
  }

  public void setStreet(String street) {
    this.street = street;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getPostalCode() {
    return postalCode;
  }

  public void setPostalCode(String postalCode) {
    this.postalCode = postalCode;
  }

  public String getStreetAddress() {
    return streetAddress;
  }

  public void setStreetAddress(String streetAddress) {
    this.streetAddress = streetAddress;
  }

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }

  public Boolean getIsActive() {
    return isActive;
  }

  public void setIsActive(Boolean active) {
    isActive = active;
  }

  public Integer getViews() {
    return views;
  }

  public void setViews(Integer views) {
    this.views = views;
  }
}

