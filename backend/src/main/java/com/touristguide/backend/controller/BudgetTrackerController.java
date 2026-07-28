package com.touristguide.backend.controller;

import com.touristguide.backend.model.BudgetTracker;
import com.touristguide.backend.model.TripCart;
import com.touristguide.backend.repository.BudgetTrackerRepository;
import com.touristguide.backend.repository.TripCartRepository;
import org.springframework.web.bind.annotation.*;

import com.touristguide.backend.exception.ResourceNotFoundException;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "*")
public class BudgetTrackerController {

    private final BudgetTrackerRepository budgetTrackerRepository;
    private final TripCartRepository tripCartRepository;

    public BudgetTrackerController(BudgetTrackerRepository budgetTrackerRepository,
                                   TripCartRepository tripCartRepository) {
        this.budgetTrackerRepository = budgetTrackerRepository;
        this.tripCartRepository = tripCartRepository;
    }

    // Attach a budget to a trip cart
    @PostMapping("/cart/{cartId}")
    public BudgetTracker createBudget(@PathVariable Long cartId, @RequestBody BudgetTracker budgetData) {
        TripCart cart = tripCartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip cart not found"));

        BudgetTracker budget = budgetTrackerRepository.save(budgetData);
        cart.setBudget(budget);
        tripCartRepository.save(cart);

        return budget;
    }

    // Update spent amount (after a booking is confirmed)
    @PutMapping("/{budgetId}/spend")
    public BudgetTracker addSpending(@PathVariable Long budgetId, @RequestParam float amount) {
        BudgetTracker budget = budgetTrackerRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        budget.setSpentSoFar(budget.getSpentSoFar() + amount);
        return budgetTrackerRepository.save(budget);
    }

    // Check status
    @GetMapping("/{budgetId}")
    public BudgetTracker getBudget(@PathVariable Long budgetId) {
        return budgetTrackerRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
    }

    @GetMapping("/{budgetId}/over-budget")
    public boolean checkOverBudget(@PathVariable Long budgetId) {
        BudgetTracker budget = budgetTrackerRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        return budget.isOverBudget();
    }
}