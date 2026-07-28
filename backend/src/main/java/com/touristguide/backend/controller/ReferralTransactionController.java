package com.touristguide.backend.controller;

import com.touristguide.backend.model.*;
import com.touristguide.backend.repository.*;
import org.springframework.web.bind.annotation.*;

import com.touristguide.backend.exception.ResourceNotFoundException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/referrals")
@CrossOrigin(origins = "*")
public class ReferralTransactionController {

    private final ReferralTransactionRepository referralTransactionRepository;
    private final UserAccountRepository userAccountRepository;
    private final LocalPartnerRepository localPartnerRepository;

    public ReferralTransactionController(ReferralTransactionRepository referralTransactionRepository,
                                         UserAccountRepository userAccountRepository,
                                         LocalPartnerRepository localPartnerRepository) {
        this.referralTransactionRepository = referralTransactionRepository;
        this.userAccountRepository = userAccountRepository;
        this.localPartnerRepository = localPartnerRepository;
    }

    // Log a click (tourist clicked "Contact Vendor")
    @PostMapping("/click/{touristId}/partner/{partnerId}")
    public ReferralTransaction logClick(@PathVariable Long touristId, @PathVariable Long partnerId) {
        UserAccount tourist = userAccountRepository.findById(touristId)
                .orElseThrow(() -> new ResourceNotFoundException("Tourist not found"));
        LocalPartner partner = localPartnerRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found"));

        ReferralTransaction transaction = new ReferralTransaction();
        transaction.setTourist(tourist);
        transaction.setPartner(partner);
        transaction.setRefCode(UUID.randomUUID().toString().substring(0, 8));
        transaction.logClick(); // sets status to CLICKED

        return referralTransactionRepository.save(transaction);
    }

    // Vendor confirms the booking  happened
    @PutMapping("/{transactionId}/confirm")
    public ReferralTransaction confirmBooking(@PathVariable Long transactionId) {
        ReferralTransaction transaction = referralTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        transaction.confirmBooking(); // sets status to CONFIRMED
        transaction.setFeeAmount(transaction.getPartner().getReferralFee());

        return referralTransactionRepository.save(transaction);
    }

    // Flag a transaction with no confirmation
    @PutMapping("/{transactionId}/flag")
    public ReferralTransaction flagTransaction(@PathVariable Long transactionId) {
        ReferralTransaction transaction = referralTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        transaction.setStatus(ReferralTransaction.Status.FLAGGED);
        return referralTransactionRepository.save(transaction);
    }

    // View all referral activity for a partner as their revenue dashboard data
    @GetMapping("/partner/{partnerId}")
    public List<ReferralTransaction> getTransactionsForPartner(@PathVariable Long partnerId) {
        return referralTransactionRepository.findByPartnerId(partnerId);
    }

    // View a tourist's referral/booking history
    @GetMapping("/tourist/{touristId}")
    public List<ReferralTransaction> getTransactionsForTourist(@PathVariable Long touristId) {
        return referralTransactionRepository.findByTouristId(touristId);
    }
}