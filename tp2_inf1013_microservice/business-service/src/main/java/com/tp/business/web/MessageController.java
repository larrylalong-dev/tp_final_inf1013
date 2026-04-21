package com.tp.business.web;

import com.tp.business.service.MessageService;
import com.tp.business.web.dto.MessageCreateRequest;
import com.tp.business.web.dto.MessageDto;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/messages")
public class MessageController {

  private final MessageService messageService;

  public MessageController(MessageService messageService) {
    this.messageService = messageService;
  }

  @GetMapping
  public List<MessageDto> getMine(Principal principal) {
    return messageService.getForCurrentUser(principal.getName());
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public MessageDto create(@Valid @RequestBody MessageCreateRequest request, Principal principal) {
    return messageService.create(request, principal.getName());
  }
}

