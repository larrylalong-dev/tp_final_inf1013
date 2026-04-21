package com.tp.business.web.dto;

import jakarta.validation.constraints.NotNull;

public record ToggleActiveRequest(@NotNull Boolean isActive) {}

