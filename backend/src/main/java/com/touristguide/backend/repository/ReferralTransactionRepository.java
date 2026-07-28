package com.touristguide.backend.repository;

import com.touristguide.backend.model.ReferralTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReferralTransactionRepository extends JpaRepository<ReferralTransaction, Long> {
    List<ReferralTransaction> findByPartnerId(Long partnerId);
    List<ReferralTransaction> findByTouristId(Long touristId);
}
