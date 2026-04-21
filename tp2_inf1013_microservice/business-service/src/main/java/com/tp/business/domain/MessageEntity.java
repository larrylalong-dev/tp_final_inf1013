package com.tp.business.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "messages")
public class MessageEntity {

  @Id
  @Column(length = 80, nullable = false)
  private String id;

  @Column(name = "ad_id", nullable = false, length = 80)
  private String adId;

  @Column(name = "owner_id", nullable = false, length = 80)
  private String ownerId;

  @Column(name = "from_user_id", nullable = false, length = 80)
  private String fromUserId;

  @Column(nullable = false, length = 255)
  private String subject;

  @Column(nullable = false, length = 4000)
  private String body;

  @Column(name = "created_at", nullable = false, length = 40)
  private String createdAt;

  @PrePersist
  void initDefaults() {
    if (id == null || id.isBlank()) {
      id = "msg-" + UUID.randomUUID();
    }
    if (createdAt == null || createdAt.isBlank()) {
      createdAt = Instant.now().toString();
    }
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getAdId() {
    return adId;
  }

  public void setAdId(String adId) {
    this.adId = adId;
  }

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }

  public String getFromUserId() {
    return fromUserId;
  }

  public void setFromUserId(String fromUserId) {
    this.fromUserId = fromUserId;
  }

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public String getBody() {
    return body;
  }

  public void setBody(String body) {
    this.body = body;
  }

  public String getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(String createdAt) {
    this.createdAt = createdAt;
  }
}

