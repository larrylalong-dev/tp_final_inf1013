package com.tp.business.service;

import com.tp.business.domain.MessageEntity;
import com.tp.business.domain.MessageRepository;
import com.tp.business.web.dto.MessageCreateRequest;
import com.tp.business.web.dto.MessageDto;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MessageService {

  private final MessageRepository messageRepository;

  public MessageService(MessageRepository messageRepository) {
    this.messageRepository = messageRepository;
  }

  public MessageDto create(MessageCreateRequest request, String authenticatedUserId) {
    MessageEntity message = new MessageEntity();
    if (request.id() != null && !request.id().isBlank()) {
      message.setId(request.id());
    }

    message.setAdId(request.adId().trim());
    message.setOwnerId(request.ownerId().trim());
    message.setFromUserId(authenticatedUserId);
    message.setSubject(request.subject().trim());
    message.setBody(request.body().trim());
    if (request.createdAt() != null && !request.createdAt().isBlank()) {
      message.setCreatedAt(request.createdAt());
    }

    return toDto(messageRepository.save(message));
  }

  public List<MessageDto> getForCurrentUser(String authenticatedUserId) {
    return messageRepository.findByOwnerIdOrFromUserId(authenticatedUserId, authenticatedUserId).stream()
        .map(this::toDto)
        .sorted(Comparator.comparing(MessageDto::createdAt).reversed())
        .toList();
  }

  public List<MessageDto> getForAd(String adId) {
    return messageRepository.findByAdId(adId).stream()
        .map(this::toDto)
        .sorted(Comparator.comparing(MessageDto::createdAt).reversed())
        .toList();
  }

  private MessageDto toDto(MessageEntity message) {
    return new MessageDto(
        message.getId(),
        message.getAdId(),
        message.getOwnerId(),
        message.getFromUserId(),
        message.getSubject(),
        message.getBody(),
        message.getCreatedAt());
  }
}

