package com.touristguide.backend.repository;

import com.touristguide.backend.model.BudgetTracker;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetTrackerRepository extends JpaRepository<BudgetTracker, Long> {
}