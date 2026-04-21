package com.tp.business.service;

import com.tp.business.domain.AdEntity;
import com.tp.business.domain.AdRepository;
import com.tp.business.web.dto.AdDto;
import com.tp.business.web.dto.AdUpsertRequest;
import com.tp.business.web.dto.ToggleActiveRequest;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdService {

  private static final String PLACEHOLDER_PHOTO = "assets/images/placeholder.svg";

  private final AdRepository adRepository;

  public AdService(AdRepository adRepository) {
    this.adRepository = adRepository;
  }

  public List<AdDto> getAll() {
    return adRepository.findAll().stream().map(this::toDto).toList();
  }

  public AdDto getById(String id) {
    return toDto(findOrThrow(id));
  }

  public List<AdDto> getMine(String ownerId) {
    return adRepository.findByOwnerId(ownerId).stream().map(this::toDto).toList();
  }

  public AdDto create(AdUpsertRequest request, String authenticatedUserId) {
    AdEntity ad = new AdEntity();
    apply(request, ad, authenticatedUserId, false);
    return toDto(adRepository.save(ad));
  }

  public AdDto update(String id, AdUpsertRequest request, String authenticatedUserId) {
    AdEntity ad = findOrThrow(id);
    if (!ad.getOwnerId().equals(authenticatedUserId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can update ad.");
    }

    apply(request, ad, authenticatedUserId, true);
    ad.setId(id);
    return toDto(adRepository.save(ad));
  }

  public void delete(String id, String authenticatedUserId) {
    AdEntity ad = findOrThrow(id);
    if (!ad.getOwnerId().equals(authenticatedUserId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can delete ad.");
    }
    adRepository.delete(ad);
  }

  public AdDto toggleActive(String id, ToggleActiveRequest request, String authenticatedUserId) {
    AdEntity ad = findOrThrow(id);
    if (!ad.getOwnerId().equals(authenticatedUserId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only owner can toggle ad.");
    }

    ad.setIsActive(Boolean.TRUE.equals(request.isActive()));
    return toDto(adRepository.save(ad));
  }

  public void incrementViews(String id) {
    AdEntity ad = findOrThrow(id);
    ad.setViews((ad.getViews() == null ? 0 : ad.getViews()) + 1);
    adRepository.save(ad);
  }

  private AdEntity findOrThrow(String id) {
    return adRepository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ad not found."));
  }

  private void apply(AdUpsertRequest request, AdEntity ad, String authenticatedUserId, boolean isUpdate) {
    ad.setTitle(request.title().trim());
    ad.setShortDescription(request.shortDescription().trim());
    ad.setLongDescription(request.longDescription().trim());
    ad.setMonthlyRent(request.monthlyRent());
    ad.setAvailableFrom(request.availableFrom().trim());
    ad.setPhotosText(serializePhotos(request.photos()));
    ad.setLocationAddress(request.locationAddress().trim());
    ad.setStreet(trimOrNull(request.street()));
    ad.setCity(trimOrNull(request.city()));
    ad.setPostalCode(trimOrNull(request.postalCode()));
    ad.setStreetAddress(trimOrNull(request.streetAddress()));

    if (!isUpdate) {
      ad.setOwnerId(authenticatedUserId);
      ad.setIsActive(request.isActive() == null || request.isActive());
      ad.setViews(request.views() == null ? 0 : request.views());
      if (request.id() != null && !request.id().isBlank()) {
        ad.setId(request.id());
      }
    }
  }

  private AdDto toDto(AdEntity ad) {
    return new AdDto(
        ad.getId(),
        ad.getTitle(),
        ad.getShortDescription(),
        ad.getLongDescription(),
        ad.getMonthlyRent(),
        ad.getAvailableFrom(),
        deserializePhotos(ad.getPhotosText()),
        ad.getLocationAddress(),
        ad.getStreet(),
        ad.getCity(),
        ad.getPostalCode(),
        ad.getStreetAddress(),
        ad.getOwnerId(),
        ad.getIsActive(),
        ad.getViews());
  }

  private String serializePhotos(List<String> photos) {
    if (photos == null || photos.isEmpty()) {
      return PLACEHOLDER_PHOTO;
    }
    return photos.stream().map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.joining("\n"));
  }

  private List<String> deserializePhotos(String photosText) {
    if (photosText == null || photosText.isBlank()) {
      return List.of(PLACEHOLDER_PHOTO);
    }
    List<String> photos =
        Arrays.stream(photosText.split("\\n"))
            .map(String::trim)
            .filter(s -> !s.isBlank())
            .toList();
    return photos.isEmpty() ? List.of(PLACEHOLDER_PHOTO) : photos;
  }

  private String trimOrNull(String value) {
    if (value == null) {
      return null;
    }
    String trimmed = value.trim();
    return trimmed.isBlank() ? null : trimmed;
  }
}

