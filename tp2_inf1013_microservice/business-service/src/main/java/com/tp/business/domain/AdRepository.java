package com.tp.business.domain;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdRepository extends JpaRepository<AdEntity, String> {

  List<AdEntity> findByOwnerId(String ownerId);
}

