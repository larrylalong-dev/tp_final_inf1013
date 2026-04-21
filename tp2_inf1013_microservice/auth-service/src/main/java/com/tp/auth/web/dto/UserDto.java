package com.tp.auth.web.dto;

public record UserDto(
    String id,
    String firstName,
    String lastName,
    String phone,
    String email,
    String address) {}

