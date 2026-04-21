package com.tp.auth.web.dto;

public record AuthResponse(String accessToken, UserDto user) {}

