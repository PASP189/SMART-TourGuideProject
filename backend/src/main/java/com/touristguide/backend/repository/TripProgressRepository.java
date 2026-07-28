package com.touristguide.backend.repository;

import com.touristguide.backend.model.TripProgress;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripProgressRepository extends JpaRepository<TripProgress, Long> {
}