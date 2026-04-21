package com.tp.business.web.dto;

import java.util.List;

public record AdDto(
    String id,
    String title,
    String shortDescription,
    String longDescription,
    Integer monthlyRent,
    String availableFrom,
    List<String> photos,
    String locationAddress,
    String street,
    String city,
    String postalCode,
    String streetAddress,
    String ownerId,
    Boolean isActive,
    Integer views) {}

