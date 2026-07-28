package com.touristguide.backend.repository;

import com.touristguide.backend.model.LocalPartner;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocalPartnerRepository extends JpaRepository<LocalPartner, Long> {
}