package com.touristguide.backend.model;

import jakarta.persistence.*;

@Entity
public class BudgetTracker {

    private float totalBudget;
    private float spentSoFar;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public float getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(float totalBudget) {
        this.totalBudget = totalBudget;
    }

    public float getSpentSoFar() {
        return spentSoFar;
    }

    public void setSpentSoFar(float spentSoFar) {
        this.spentSoFar = spentSoFar;
    }



    public boolean isOverBudget() {
        return spentSoFar > totalBudget;
    }

}