// ===============================
// VISIT LANKA - JOURNEY DETAILS
// Now connected to Spring Boot backend
// ===============================

const API_BASE = "http://localhost:8080/api";

const EXCHANGE_RATE = 305;

const selectedDestinations =
    JSON.parse(localStorage.getItem("selectedDestinations")) || [];

const selectedPartners =
    JSON.parse(localStorage.getItem("selectedPartners")) || [];

const destinationList =
    document.getElementById("destinationList");

const partnerList =
    document.getElementById("partnerList");

let allPartners = [];
let allDestinations = [];

// ===============================
// FIND PARTNER BY ID
// ===============================

function findPartner(id) {
    return allPartners.find(partner => String(partner.id) === String(id)) || null;
}

// ===============================
// FIND DESTINATION BY NAME
// selectedDestinations in localStorage only holds plain name
// strings (e.g. "Ella") - this looks up the matching real
// Destination row from the backend so we get its numeric id.
// ===============================

function findDestinationByName(name) {
    return allDestinations.find(
        d => d.name && d.name.trim().toLowerCase() === name.trim().toLowerCase()
    ) || null;
}

// ===============================
// ICON BY CATEGORY
// ===============================

function getIcon(partner) {

    const category = (partner.category || "").toLowerCase();

    if (category === "hotel") return "🏨";
    if (category === "agency") return "🧳";
    if (category === "rental") return "🚗";
    if (category === "guide") return "🧑‍💼";

    return "⭐";

}

// ===============================
// PRICE HELPERS
// ===============================

function getPriceLKR(partner) {

    if (!partner) return 0;

    if (partner.lkrPrice) return Number(partner.lkrPrice);

    if (partner.usdPrice) return Math.round(Number(partner.usdPrice) * EXCHANGE_RATE);

    if (!partner.price) return 0;

    return Number(partner.price.replace(/[^0-9]/g, ""));

}

// ===============================
// LOAD PARTNERS + DESTINATIONS FROM BACKEND, THEN RENDER
// ===============================

async function loadPartnersAndRender() {

    try {

        const [partnersRes, destinationsRes] = await Promise.all([
            fetch(`${API_BASE}/partners`),
            fetch(`${API_BASE}/destinations`)
        ]);

        if (!partnersRes.ok) throw new Error("Partners: server responded with " + partnersRes.status);
        if (!destinationsRes.ok) throw new Error("Destinations: server responded with " + destinationsRes.status);

        allPartners = await partnersRes.json();
        allDestinations = await destinationsRes.json();

    } catch (err) {

        console.error("Failed to load data:", err);

        partnerList.innerHTML =
            "<p class='error-msg'>Could not load travel data. Make sure the backend is running on localhost:8080.</p>";

    }

    renderDestinations();
    renderPartners();
    renderSummary();

}

// ===============================
// DESTINATIONS
// ===============================

function renderDestinations() {

    destinationList.innerHTML = "";

    if (selectedDestinations.length === 0) {
        destinationList.innerHTML = "<p>No destinations selected.</p>";
        return;
    }

    selectedDestinations.forEach(destination => {

        const item = document.createElement("div");

        item.className = "destination-item";

        item.innerHTML = `<h3>📍 ${destination}</h3>`;

        destinationList.appendChild(item);

    });

}

// ===============================
// TRAVEL PARTNERS
// ===============================

function renderPartners() {

    partnerList.innerHTML = "";

    const validPartners = selectedPartners
        .map(id => findPartner(id))
        .filter(partner => partner !== null);

    if (validPartners.length === 0) {
        partnerList.innerHTML = "<p>No travel partners selected yet.</p>";
        return;
    }

    validPartners.forEach(partner => {

        const item = document.createElement("div");

        item.className = "partner-item";

        item.innerHTML = `<h3>${getIcon(partner)} ${partner.businessName}</h3>`;

        partnerList.appendChild(item);

    });

}

// ===============================
// SUMMARY
// ===============================

function renderSummary() {

    document.getElementById("journeyDate").textContent =
        new Date().toLocaleDateString();

    const flightLKR = 128100;

    let totalLKR = flightLKR;

    selectedPartners.forEach(id => {
        const partner = findPartner(id);
        if (partner) totalLKR += getPriceLKR(partner);
    });

    const totalUSD = Math.round(totalLKR / EXCHANGE_RATE);

    document.getElementById("journeyBudget").textContent =
        `USD ${totalUSD} (LKR ${totalLKR.toLocaleString()})`;

    document.getElementById("destinationCount").textContent =
        selectedDestinations.length;

    document.getElementById("partnerCount").textContent =
        selectedPartners.length;

}

// ===============================
// SAVE JOURNEY TO BACKEND
// Creates a real TripCart row so it shows up in the admin
// "Saved Journeys" table.
// ===============================

async function saveJourneyToBackend() {

    // NOTE: adjust this key if your login flow stores the
    // logged-in user's id under a different localStorage key.
    const userId = localStorage.getItem("userId");

    if (!userId) {
       "No logged-in user — skipping backend save."
        return false;
    }

    try {

        // 1. Create an empty cart for this user
        const createRes = await fetch(`${API_BASE}/tripcarts/create/${userId}`, {
            method: "POST"
        });

        if (!createRes.ok) throw new Error("Could not create trip cart: " + createRes.status);

        const cart = await createRes.json();

        // 2. Add each selected destination to the cart
        for (const destName of selectedDestinations) {

            const destination = findDestinationByName(destName);

            if (!destination) {
                console.warn(`Destination "${destName}" not found on backend, skipping.`);
                continue;
            }

            const addRes = await fetch(
                `${API_BASE}/tripcarts/${cart.id}/add-destination/${destination.id}`,
                { method: "POST" }
            );

            if (!addRes.ok) {
                console.warn(`Failed to add destination "${destName}" to cart: ` + addRes.status);
            }

        }

        return true;

    } catch (err) {

        console.error("Failed to save journey:", err);
        alert("Could not save your journey. Please check your connection and try again.");
        return false;

    }

}

// ===============================
// BUTTONS
// ===============================

document.getElementById("downloadBtn")
    .addEventListener("click", function () {
        window.print();
    });

document.getElementById("finishBtn").addEventListener("click", async () => {

    const finishBtn = document.getElementById("finishBtn");

    finishBtn.disabled = true;
    finishBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

    // Try to save if a user happens to be logged in, but don't block checkout either way
    await saveJourneyToBackend();

    localStorage.removeItem("selectedDestinations");
    localStorage.removeItem("selectedPartners");

    window.location.href = "checkout.html";

});

// ===============================
// INITIALIZE
// ===============================

loadPartnersAndRender();