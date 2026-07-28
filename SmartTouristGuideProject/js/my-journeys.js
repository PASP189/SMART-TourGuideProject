const journeyList = document.getElementById("journeyList");

// FIX: this used to build a `journey` object from selectedDestinations /
// selectedPartners with a hardcoded budgetUSD: 420 / budgetLKR: 128100
// (just the flight estimate), so the price shown here never matched
// what was actually calculated on the Journey Planner page. Now we
// read the "savedJourney" record that journey-planner.js writes to
// localStorage when "Confirm & Save Journey" is clicked - it already
// contains the real computed totals.

const savedJourneyRaw = localStorage.getItem("savedJourney");
const savedJourney = savedJourneyRaw ? JSON.parse(savedJourneyRaw) : null;

const journey = savedJourney
    ? {
        id: savedJourney.id || "JL-2026-001",
        status: savedJourney.status || "Planned",
        date: savedJourney.date || new Date().toLocaleDateString(),
        destinations: savedJourney.destinations || [],
        partnerCount: savedJourney.partnerCount
            ?? (savedJourney.partners ? savedJourney.partners.length : 0),
        budgetUSD: savedJourney.budgetUSD ?? 0,
        budgetLKR: savedJourney.budgetLKR ?? 0
    }
    : null;

displayJourney();

function displayJourney(){

    journeyList.innerHTML = "";

    if (!journey) {

        journeyList.innerHTML = `
            <p class="empty-msg">
                You haven't saved a journey yet. Head over to the
                Journey Planner and click "Confirm & Save Journey".
            </p>
        `;

        return;

    }

    const card=document.createElement("div");

    card.className="journey-card";

    card.innerHTML=`

        <div class="card-header">

            <h3>${journey.id}</h3>

            <span class="status">

                ${journey.status}

            </span>

        </div>

        <div class="card-body">

            <p>

                <strong>Created :</strong>

                ${journey.date}

            </p>

            <p>

                <strong>Destinations :</strong>

            </p>

            <div class="destination-list">

                ${journey.destinations.map(destination=>`

                    <div class="destination-item">

                        📍 ${destination}

                    </div>

                `).join("")}

            </div>

            <p>

                <strong>Travel Partners :</strong>

                ${journey.partnerCount}

            </p>

            <div class="budget">

                USD ${journey.budgetUSD}

            </div>

            <small>

                (LKR ${journey.budgetLKR.toLocaleString()})

            </small>

            <button
                class="view-btn"
                onclick="viewJourney()">

                View Journey Details

            </button>

        </div>

    `;

    journeyList.appendChild(card);

}

function viewJourney(){

    window.location.href="journey-details.html";

}