package com.touristguide.backend.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class BudgetTrackerTest {

    @Test
    void isOverBudget_returnsTrue_whenSpentExceedsTotal() {
        BudgetTracker budget = new BudgetTracker();
        budget.setTotalBudget(50000);
        budget.setSpentSoFar(60000);

        assertTrue(budget.isOverBudget(), "Should be over budget when spent exceeds total");
    }

    @Test
    void isOverBudget_returnsFalse_whenSpentIsWithinTotal() {
        BudgetTracker budget = new BudgetTracker();
        budget.setTotalBudget(50000);
        budget.setSpentSoFar(30000);

        assertFalse(budget.isOverBudget(), "Should not be over budget when spent is within total");
    }
}