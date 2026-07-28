package com.touristguide.backend.repository;

import com.touristguide.backend.model.TripCart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripCartRepository extends JpaRepository<TripCart, Long> {
    List<TripCart> findByOwnerId(Long ownerId);
}