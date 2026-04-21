package com.tp.auth.service;

import com.tp.auth.domain.UserAccount;
import com.tp.auth.domain.UserAccountRepository;
import com.tp.auth.security.JwtService;
import com.tp.auth.web.dto.AuthResponse;
import com.tp.auth.web.dto.LoginRequest;
import com.tp.auth.web.dto.RegisterRequest;
import com.tp.auth.web.dto.UpdateProfileRequest;
import com.tp.auth.web.dto.UserDto;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

  private final UserAccountRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthService(
      UserAccountRepository userRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  public AuthResponse register(RegisterRequest request) {
    if (userRepository.existsByEmailIgnoreCase(request.email())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered.");
    }

    UserAccount user = new UserAccount();
    user.setFirstName(request.firstName().trim());
    user.setLastName(request.lastName().trim());
    user.setPhone(request.phone().trim());
    user.setEmail(request.email().trim().toLowerCase());
    user.setAddress(request.address().trim());
    user.setPasswordHash(passwordEncoder.encode(request.password()));

    UserAccount saved = userRepository.save(user);
    return buildAuthResponse(saved);
  }

  public AuthResponse login(LoginRequest request) {
    UserAccount user =
        userRepository
            .findByEmailIgnoreCase(request.email().trim())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));

    if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
    }

    return buildAuthResponse(user);
  }

  public UserDto me(Authentication authentication) {
    UserAccount user = requireAuthenticatedUser(authentication);
    return toDto(user);
  }

  public UserDto updateMe(Authentication authentication, UpdateProfileRequest request) {
    UserAccount user = requireAuthenticatedUser(authentication);
    user.setFirstName(request.firstName().trim());
    user.setLastName(request.lastName().trim());
    user.setPhone(request.phone().trim());
    user.setAddress(request.address().trim());
    return toDto(userRepository.save(user));
  }

  private AuthResponse buildAuthResponse(UserAccount user) {
    String token = jwtService.generateToken(user.getId());
    return new AuthResponse(token, toDto(user));
  }

  private UserAccount requireAuthenticatedUser(Authentication authentication) {
    if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount user)) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
    }
    return user;
  }

  private UserDto toDto(UserAccount user) {
    return new UserDto(
        user.getId(),
        user.getFirstName(),
        user.getLastName(),
        user.getPhone(),
        user.getEmail(),
        user.getAddress());
  }
}

