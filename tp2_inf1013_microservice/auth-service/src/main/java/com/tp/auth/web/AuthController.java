package com.tp.auth.web;

import com.tp.auth.service.AuthService;
import com.tp.auth.web.dto.AuthResponse;
import com.tp.auth.web.dto.ForgotPasswordRequest;
import com.tp.auth.web.dto.LoginRequest;
import com.tp.auth.web.dto.RegisterRequest;
import com.tp.auth.web.dto.UpdateProfileRequest;
import com.tp.auth.web.dto.UserDto;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @GetMapping("/me")
  public UserDto me(Authentication authentication) {
    return authService.me(authentication);
  }

  @PutMapping("/me")
  public UserDto updateMe(
      Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
    return authService.updateMe(authentication, request);
  }

  @PostMapping("/forgot-password")
  public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
    return Map.of("message", "Recovery flow is acknowledged for " + request.email());
  }
}

