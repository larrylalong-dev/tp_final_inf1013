package com.tp.business.web;

import com.tp.business.service.AdService;
import com.tp.business.service.MessageService;
import com.tp.business.web.dto.AdDto;
import com.tp.business.web.dto.AdUpsertRequest;
import com.tp.business.web.dto.MessageDto;
import com.tp.business.web.dto.ToggleActiveRequest;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ads")
public class AdController {

  private final AdService adService;
  private final MessageService messageService;

  public AdController(AdService adService, MessageService messageService) {
    this.adService = adService;
    this.messageService = messageService;
  }

  @GetMapping
  public List<AdDto> getAll() {
    return adService.getAll();
  }

  @GetMapping("/{id}")
  public AdDto getById(@PathVariable String id) {
    return adService.getById(id);
  }

  @GetMapping("/mine")
  public List<AdDto> getMine(Principal principal) {
    return adService.getMine(principal.getName());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public AdDto create(@Valid @RequestBody AdUpsertRequest request, Principal principal) {
    return adService.create(request, principal.getName());
  }

  @PutMapping("/{id}")
  public AdDto update(
      @PathVariable String id, @Valid @RequestBody AdUpsertRequest request, Principal principal) {
    return adService.update(id, request, principal.getName());
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable String id, Principal principal) {
    adService.delete(id, principal.getName());
  }

  @PatchMapping("/{id}/active")
  public AdDto toggleActive(
      @PathVariable String id,
      @Valid @RequestBody ToggleActiveRequest request,
      Principal principal) {
    return adService.toggleActive(id, request, principal.getName());
  }

  @PostMapping("/{id}/views")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void incrementViews(@PathVariable String id) {
    adService.incrementViews(id);
  }

  @GetMapping("/{id}/messages")
  public List<MessageDto> getAdMessages(@PathVariable String id) {
    return messageService.getForAd(id);
  }
}

