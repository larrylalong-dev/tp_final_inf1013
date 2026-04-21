package com.tp.business.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MessageCreateRequest(
    String id,
    @NotBlank String adId,
    @NotBlank String ownerId,
    String fromUserId,
    @NotBlank @Size(min = 3, max = 255) String subject,
    @NotBlank @Size(min = 5, max = 4000) String body,
    String createdAt) {}

