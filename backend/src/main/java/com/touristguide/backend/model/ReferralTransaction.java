package com.touristguide.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class ReferralTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String refCode;


    @ManyToOne
    @JoinColumn(name = "tourist_id")
    @JsonIgnore
    private UserAccount tourist;

    @ManyToOne
    @JoinColumn(name = "partner_id")
    @JsonIgnore
    private LocalPartner partner;

    @Enumerated(EnumType.STRING)
    private Status status;

    private float feeAmount;

    public enum Status { CLICKED, CONFIRMED, FLAGGED }

    public void logClick() {
        this.status = Status.CLICKED;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRefCode() {
        return refCode;
    }

    public void setRefCode(String refCode) {
        this.refCode = refCode;
    }

    public UserAccount getTourist() {
        return tourist;
    }

    public void setTourist(UserAccount tourist) {
        this.tourist = tourist;
    }

    public LocalPartner getPartner() {
        return partner;
    }

    public void setPartner(LocalPartner partner) {
        this.partner = partner;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public float getFeeAmount() {
        return feeAmount;
    }

    public void setFeeAmount(float feeAmount) {
        this.feeAmount = feeAmount;
    }

    public void confirmBooking() {
        this.status = Status.CONFIRMED;
        // later also update feeAmount and credit partner
    }


}
