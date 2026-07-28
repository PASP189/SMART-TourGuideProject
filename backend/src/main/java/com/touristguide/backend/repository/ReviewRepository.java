package com.touristguide.backend.repository;

import com.touristguide.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByPartnerId(Long partnerId);
}