package com.tp.auth.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 2, max = 120) String firstName,
    @NotBlank @Size(min = 2, max = 120) String lastName,
    @NotBlank @Pattern(regexp = "^[0-9+()\\s-]{7,}$") String phone,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 4, max = 255) String address,
    @NotBlank @Size(min = 4, max = 120) String password) {}

