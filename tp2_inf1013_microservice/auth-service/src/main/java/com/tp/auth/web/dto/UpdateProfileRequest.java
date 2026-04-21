package com.tp.auth.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank @Size(min = 2, max = 120) String firstName,
    @NotBlank @Size(min = 2, max = 120) String lastName,
    @NotBlank @Pattern(regexp = "^[0-9+()\\s-]{7,}$") String phone,
    @NotBlank @Size(min = 4, max = 255) String address) {}

