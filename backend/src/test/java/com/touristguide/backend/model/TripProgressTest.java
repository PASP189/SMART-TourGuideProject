package com.touristguide.backend.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TripProgressTest {

    @Test
    void triggerSafetyAlertIfNear_returnsTrue_whenAtSameDestination() {
        //  set up the objects we need for this test
        Destination sigiriya = new Destination();
        sigiriya.setId(1L);
        sigiriya.setName("Sigiriya");

        TripProgress progress = new TripProgress();
        progress.setCurrentNearest(sigiriya);

        // call the actual testing method
        boolean result = progress.triggerSafetyAlertIfNear(sigiriya);

        // check the result is what we expect
        assertTrue(result, "Should return true when the tourist is at the same destination");
    }

    @Test
    void triggerSafetyAlertIfNear_returnsFalse_whenAtDifferentDestination() {
        Destination sigiriya = new Destination();
        sigiriya.setId(1L);

        Destination ella = new Destination();
        ella.setId(2L);

        TripProgress progress = new TripProgress();
        progress.setCurrentNearest(sigiriya);

        boolean result = progress.triggerSafetyAlertIfNear(ella);

        assertFalse(result, "Should return false when the tourist is near a different destination");
    }
}