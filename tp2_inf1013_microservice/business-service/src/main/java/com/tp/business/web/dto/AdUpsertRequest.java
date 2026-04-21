package com.tp.business.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AdUpsertRequest(
    String id,
    @NotBlank @Size(min = 5, max = 180) String title,
    @NotBlank @Size(max = 240) String shortDescription,
    @NotBlank @Size(min = 20, max = 4000) String longDescription,
    @NotNull @Min(0) Integer monthlyRent,
    @NotBlank String availableFrom,
    @NotEmpty List<String> photos,
    @NotBlank String locationAddress,
    String street,
    String city,
    String postalCode,
    String streetAddress,
    String ownerId,
    Boolean isActive,
    Integer views) {}

