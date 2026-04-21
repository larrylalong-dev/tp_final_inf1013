package com.tp.business.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<MessageEntity, String> {

  List<MessageEntity> findByAdId(String adId);

  List<MessageEntity> findByOwnerIdOrFromUserId(String ownerId, String fromUserId);
}

