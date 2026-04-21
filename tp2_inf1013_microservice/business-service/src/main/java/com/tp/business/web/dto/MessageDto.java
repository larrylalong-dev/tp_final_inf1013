package com.tp.business.web.dto;

public record MessageDto(
    String id,
    String adId,
    String ownerId,
    String fromUserId,
    String subject,
    String body,
    String createdAt) {}

