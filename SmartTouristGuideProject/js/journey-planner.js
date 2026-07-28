// ======================================================
// VISIT LANKA - JOURNEY PLANNER
// Now connected to Spring Boot backend
// ======================================================

const API_BASE = "http://localhost:8080/api";

// -------------------------------
// Exchange Rate
// -------------------------------

const EXCHANGE_RATE = 305;

// -------------------------------
// Local Storage
// -------------------------------

const selectedDestinations =
JSON.parse(localStorage.getItem("selectedDestinations")) || [];

const selectedPartners =
JSON.parse(localStorage.getItem("selectedPartners")) || [];

const questionnaireData =
JSON.parse(localStorage.getItem("questionnaireData")) || {};

// Full partner objects saved by travel-partners.js at the moment
// each one was selected. This is the fallback (and usually primary)
// source used to render this page, so selections still show up even
// if the backend fetch below fails or is slow.
const selectedPartnerData =
JSON.parse(localStorage.getItem("selectedPartnerData")) || [];

// Filled in by loadPartners() below - holds the real partner
// objects fetched from the backend, since selectedPartners in
// localStorage only holds their id strings.
let allPartners = [];

// Set inside updateBudget() below and reused when saving the
// journey to the backend, so the trip cart can be created with
// the same total the person actually sees on this page.
let currentGrandTotalLKR = 0;

// Add near destinationContainer / hotelContainer, etc.
const agencyContainer =
document.getElementById("agencyContainer");
// -------------------------------
// Containers
// -------------------------------

const destinationContainer =
document.getElementById("destinationContainer");

const hotelContainer =
document.getElementById("hotelContainer");

const transportContainer =
document.getElementById("transportContainer");

const guideContainer =
document.getElementById("guideContainer");

const experienceContainer =
document.getElementById("experienceContainer");


// -------------------------------
// Budget Labels
// -------------------------------

const hotelBudget =
document.getElementById("hotelBudget");

const transportBudget =
document.getElementById("transportBudget");

const guideBudget =
document.getElementById("guideBudget");

const experienceBudget =
document.getElementById("experienceBudget");

const flightBudget =
document.getElementById("flightBudget");

const totalBudget =
document.getElementById("totalBudget");


// -------------------------------
// Buttons
// -------------------------------

const editJourney =
document.getElementById("editJourney");

const saveJourney =
document.getElementById("saveJourney");

const saveMessage =
document.getElementById("saveMessage");


// ======================================================
// FETCH PARTNERS FROM BACKEND
// ======================================================

async function loadPartners() {

    try {

        const response = await fetch(`${API_BASE}/partners`);

        if (!response.ok) {
            throw new Error("Server responded with " + response.status);
        }

        allPartners = await response.json();

    } catch (err) {

        // Backend is unreachable (e.g. not running). We don't need to
        // show an error here - the full details for every selected
        // partner were already saved in selectedPartnerData when the
        // person picked them on the Travel Partners page, and
        // findPartner() below will fall back to that automatically.
        console.error(
            "Could not reach the backend at " + API_BASE +
            " - falling back to locally saved selections.",
            err
        );

        allPartners = [];

    }

    // Only render once we actually have the data
    displayDestinations();
    displayHotel();
    displayTransport();
    displayGuide();
    displayExperiences();
    updateBudget();
    checkBudget();
    displayAgency();   

}


// ======================================================
// FIND PARTNER BY ID
// Looks the id up in whatever the backend actually returned,
// instead of the old hardcoded partnerDatabase object.
// ======================================================

function findPartner(id){

    id = String(id);

    // Prefer the freshly-fetched backend data (most up to date),
    // but fall back to the copy saved at selection time so the
    // planner still works if the backend is down or slow.
    return allPartners.find(partner => String(partner.id) === id)
        || selectedPartnerData.find(partner => String(partner.id) === id)
        || null;

}


// ======================================================
// GET PRICE IN LKR
// Backend partners store price as usdPrice, lkrPrice, or a
// free-text price string - this normalizes all three to LKR
// so the existing budget math keeps working.
// ======================================================

function getPriceLKR(partner){

    if (!partner) return 0;

    if (partner.lkrPrice) {
        return Number(partner.lkrPrice);
    }

    if (partner.usdPrice) {
        return Math.round(Number(partner.usdPrice) * EXCHANGE_RATE);
    }

    return getPrice(partner.price);

}


// ======================================================
// EXTRACT LKR PRICE FROM A TEXT STRING
// (kept for partners that only have a free-text price like
// "LKR 8,000 / Day" or "Customized Tours")
// ======================================================

function getPrice(priceText){

    if(!priceText) return 0;

    return Number(

        priceText

        .replace(/[^0-9]/g,"")

    );

}


// ======================================================
// CONVERT TO USD
// ======================================================

function convertToUSD(lkr){

    return Math.round(

        lkr / EXCHANGE_RATE

    );

}


// ======================================================
// FORMAT PRICE
// ======================================================

function priceHTML(lkr){

    const usd = convertToUSD(lkr);

    return `
        <p>Your Price</p>
        <h4>
            $${usd}
            <small>(LKR ${lkr.toLocaleString()})</small>
        </h4>
    `;
}


// ======================================================
// CREATE EMPTY CARD
// ======================================================

function emptyCard(title){

    return `

        <div class="empty-card">

            <i class="fa-regular fa-circle"></i>

            <h3>${title}</h3>

            <p>

                No selection made.

            </p>

        </div>

    `;

}


// ======================================================
// REMOVE PARTNER
// ======================================================

function removePartner(id){

    id = String(id);

    const index =

    selectedPartners.indexOf(id);

    if(index !== -1){

        selectedPartners.splice(index,1);

    }

    const dataIndex =

    selectedPartnerData.findIndex(partner => String(partner.id) === id);

    if(dataIndex !== -1){

        selectedPartnerData.splice(dataIndex,1);

    }

    localStorage.setItem(

        "selectedPartners",

        JSON.stringify(selectedPartners)

    );

    localStorage.setItem(

        "selectedPartnerData",

        JSON.stringify(selectedPartnerData)

    );

    location.reload();

}

// ======================================================
// DISPLAY SELECTED DESTINATIONS
// ======================================================

function displayDestinations(){

    destinationContainer.innerHTML = "";

    if(selectedDestinations.length === 0){

        destinationContainer.innerHTML =
        emptyCard("No Destination Selected");

        return;

    }

    selectedDestinations.forEach(destination=>{

        destinationContainer.innerHTML +=

        `<span class="destination-tag">

            📍 ${destination}

        </span>`;

    });

}


// ======================================================
// CREATE PARTNER CARD
// ======================================================

function createJourneyCard(partner){

    const lkr = getPriceLKR(partner);

    const location =
        (partner.coveredDestinations && partner.coveredDestinations[0]) || "";

    const features = (partner.features && partner.features.length)
        ? partner.features.map(f => `<span>${f}</span>`).join("")
        : "";

    return `

    <div class="partner-card">

        <div class="partner-badge">
            <i class="fa-solid fa-star"></i>
            ${partner.verified ? "VERIFIED PARTNER" : "PENDING"}
        </div>

        <img src="${partner.image || '../images/home.jpg'}"

             alt="${partner.businessName}"

             onerror="this.onerror=null;this.src='../images/home.jpg';">

        <div class="partner-content">

            <h3>${partner.businessName}</h3>

            ${location ? `<p class="partner-location">📍 ${location}</p>` : ""}

            <div class="partner-rating">
                ⭐ ${partner.rating || "N/A"}
            </div>

            <p class="partner-description">
                ${partner.description || ""}
            </p>

            <div class="partner-features">
                ${features}
            </div>

            <div class="partner-price">
                ${priceHTML(lkr)}
            </div>

            <span class="included">
                ✔ Included In Plan
            </span>

            <button

                class="remove-btn"

                onclick="removePartner('${partner.id}')">

                <i class="fa-solid fa-trash"></i>
                Remove

            </button>

        </div>

    </div>

    `;

}


// ======================================================
// GET ALL SELECTED PARTNERS IN A CATEGORY
// (Previously each category only ever rendered the FIRST
// matching selection via .find() - so if you added more
// than one hotel/transport/guide/agency, only one showed
// up here even though all of them were saved. This now
// returns every match so nothing gets silently hidden.)
// ======================================================

function getSelectedByCategory(category){

    return selectedPartners.filter(id => {

        const partner = findPartner(id);

        return partner && (partner.category || "").toLowerCase() === category;

    });

}


// ======================================================
// DISPLAY HOTEL
// ======================================================

function displayHotel(){

    hotelContainer.innerHTML="";

    const hotelIds = getSelectedByCategory("hotel");

    if(hotelIds.length === 0){

        hotelContainer.innerHTML =

        emptyCard("Accommodation");

        return;

    }

    hotelIds.forEach(id=>{

        hotelContainer.innerHTML +=

        createJourneyCard(findPartner(id));

    });

}


// ======================================================
// DISPLAY TRANSPORT
// ======================================================

function displayTransport(){

    transportContainer.innerHTML="";

    const rentalIds = getSelectedByCategory("rental");

    if(rentalIds.length === 0){

        transportContainer.innerHTML =

        emptyCard("Transportation");

        return;

    }

    rentalIds.forEach(id=>{

        transportContainer.innerHTML +=

        createJourneyCard(findPartner(id));

    });

}


// ======================================================
// DISPLAY GUIDE
// ======================================================

function displayGuide(){

    guideContainer.innerHTML="";

    const guideIds = getSelectedByCategory("guide");

    if(guideIds.length === 0){

        guideContainer.innerHTML =

        emptyCard("Tour Guide");

        return;

    }

    guideIds.forEach(id=>{

        guideContainer.innerHTML +=

        createJourneyCard(findPartner(id));

    });

}


// ======================================================
// DISPLAY EXPERIENCES
// ======================================================

function displayExperiences(){

    experienceContainer.innerHTML="";

    const experiences =

    selectedPartners.filter(id => {

        const partner = findPartner(id);

        if (!partner) return false;

        const category = (partner.category || "").toLowerCase();

        return category !== "hotel"
            && category !== "rental"
            && category !== "guide"
            && category !== "agency";

    });

    if(experiences.length===0){

        experienceContainer.innerHTML =

        emptyCard("Experiences");

        return;

    }

    experiences.forEach(id=>{

        const experience =

        findPartner(id);

        experienceContainer.innerHTML +=

        createJourneyCard(experience);

    });

}

// ======================================================
// DISPLAY AGENCY
// ======================================================

function displayAgency(){

    agencyContainer.innerHTML="";

    const agencyIds = getSelectedByCategory("agency");

    if(agencyIds.length === 0){

        agencyContainer.innerHTML =

        emptyCard("Travel Agency");

        return;

    }

    agencyIds.forEach(id=>{

        agencyContainer.innerHTML +=

        createJourneyCard(findPartner(id));

    });

}
// ======================================================
// BUDGET CALCULATOR
// ======================================================

function updateBudget(){

    let hotelTotal = 0;

    let transportTotal = 0;

    let guideTotal = 0;

    let experienceTotal = 0;

    const flightTotal = 128100; // LKR (Estimated)

    selectedPartners.forEach(id=>{

        const partner = findPartner(id);

        if(!partner) return;

        const price = getPriceLKR(partner);

        const category = (partner.category || "").toLowerCase();

        if(category === "hotel"){

            hotelTotal += price;

        }

        else if(category === "rental"){

            transportTotal += price;

        }

        else if(category === "guide"){

            guideTotal += price;

        }

        else if(category === "agency"){

            // Optional - not included in budget
        }

        else{

            experienceTotal += price;

        }

    });

    const grandTotal =

        hotelTotal +
        transportTotal +
        guideTotal +
        experienceTotal +
        flightTotal;

    // Remember this so "Confirm & Save Journey" can send the same
    // total to the backend when creating the trip cart, and so it
    // can be stored (as real numbers, not just formatted text) for
    // the My Journeys page to read back accurately.
    currentGrandTotalLKR = grandTotal;

    // -----------------------------
    // Accommodation
    // -----------------------------

            hotelBudget.innerHTML = `
        $${convertToUSD(hotelTotal)}
        <br>
        <small>
        (LKR ${hotelTotal.toLocaleString()})
        </small>
`;
    // -----------------------------
    // Transport
    // -----------------------------

    transportBudget.innerHTML =

    `

    USD ${convertToUSD(transportTotal)}

    <br>

    <small>

    (LKR ${transportTotal.toLocaleString()})

    </small>

    `;

    // -----------------------------
    // Guide
    // -----------------------------

    guideBudget.innerHTML =

    `

    USD ${convertToUSD(guideTotal)}

    <br>

    <small>

    (LKR ${guideTotal.toLocaleString()})

    </small>

    `;

    // -----------------------------
    // Experiences
    // -----------------------------

    experienceBudget.innerHTML =

    `

    USD ${convertToUSD(experienceTotal)}

    <br>

    <small>

    (LKR ${experienceTotal.toLocaleString()})

    </small>

    `;

    // -----------------------------
    // Flights
    // -----------------------------

    flightBudget.innerHTML =

    `

    USD ${convertToUSD(flightTotal)}

    <br>

    <small>

    (LKR ${flightTotal.toLocaleString()})

    </small>

    `;

    // -----------------------------
    // Grand Total
    // -----------------------------

    totalBudget.innerHTML =

    `

    USD ${convertToUSD(grandTotal)}

    <br>

    <small>

    (LKR${grandTotal.toLocaleString()})

    </small>

    `;

}


// ======================================================
// BUDGET WARNING
// ======================================================

function checkBudget(){

    if(!questionnaireData.budget) return;

    const budgetChoice =

    questionnaireData.budget.toLowerCase();

    let limit = 0;

    if(budgetChoice.includes("low")){

        limit = 200000;

    }

    else if(budgetChoice.includes("medium")){

        limit = 400000;

    }

    else{

        limit = 700000;

    }

    let total = 128100;

    selectedPartners.forEach(id=>{

        const partner = findPartner(id);

        if(partner){

            total += getPriceLKR(partner);

        }

    });

    if(total > limit){

        const budgetCard =

        document.querySelector(".budget-card");

        if (budgetCard) {

            budgetCard.innerHTML +=

            `

            <div class="budget-alert">

            ⚠ Your estimated budget is higher than
            the budget selected in the questionnaire.

            Consider removing some travel partners
            or choosing more affordable options.

            </div>

            `;

        }

    }

}

// ======================================================
// BACK BUTTON
// ======================================================

const backButton =
document.getElementById("backButton");

if(backButton){

    backButton.addEventListener("click",()=>{

        window.location.href="travel-partners.html";

    });

}


// ======================================================
// EDIT JOURNEY
// ======================================================

if(editJourney){

    editJourney.addEventListener("click",()=>{

        window.location.href="travel-partners.html";

    });

}


// ======================================================
// SAVE JOURNEY TO THE BACKEND
// Creates a real TripCart (+ destinations) for the logged-in
// user so this trip actually shows up in Admin > Saved
// Journeys, instead of only living in this browser's
// localStorage.
// ======================================================

async function persistJourneyToBackend(){

    const loggedUserRaw = localStorage.getItem("loggedUser");

    const loggedUser =
        loggedUserRaw ? JSON.parse(loggedUserRaw) : null;

    const userId = loggedUser && loggedUser.id;

    if(!userId){

        console.warn(
            "No logged-in user found - this trip was only saved " +
            "on this device and will not appear in Admin > Saved " +
            "Journeys until the person logs in."
        );

        return;

    }

    try{

        // 1. Create the trip cart for this user.
        const createRes = await fetch(
            `${API_BASE}/tripcarts/create/${userId}`,
            { method:"POST" }
        );

        if(!createRes.ok){
            throw new Error("Could not create trip cart: " + createRes.status);
        }

        const cart = await createRes.json();

        // 2. Attach every selected destination to the cart. The
        // cart only understands real destination ids, so we look
        // each saved name up against the backend's destination list.
        if(selectedDestinations.length > 0){

            const destRes = await fetch(`${API_BASE}/destinations`);
            const allDestinations = destRes.ok ? await destRes.json() : [];

            for(const name of selectedDestinations){

                const match = allDestinations.find(d =>
                    d.name &&
                    d.name.trim().toLowerCase() === name.trim().toLowerCase()
                );

                if(!match){
                    console.warn(`Destination "${name}" not found on backend, skipping.`);
                    continue;
                }

                const addRes = await fetch(
                    `${API_BASE}/tripcarts/${cart.id}/add-destination/${match.id}`,
                    { method:"POST" }
                );

                if(!addRes.ok){
                    console.warn(`Failed to add destination "${name}" to cart: ` + addRes.status);
                }

            }

        }

        // 3. Best-effort: also attach the estimated budget shown on
        // this page. This assumes a PUT /tripcarts/{id}/budget route -
        // if your backend doesn't have that endpoint yet, this call
        // simply fails quietly and the cart/destinations above are
        // still saved correctly.
        try{

            await fetch(`${API_BASE}/tripcarts/${cart.id}/budget`, {
                method:"PUT",
                headers:{ "Content-Type":"application/json" },
                body:JSON.stringify({
                    totalBudget: convertToUSD(currentGrandTotalLKR),
                    spentSoFar: 0
                })
            });

        }catch(budgetErr){

            console.warn(
                "Could not attach a budget to the trip cart " +
                "(this endpoint may not exist on the backend yet):",
                budgetErr
            );

        }

    }catch(err){

        console.error("Failed to save journey to backend:", err);

    }

}


// ======================================================
// SAVE JOURNEY
// ======================================================

if(saveJourney){

    saveJourney.addEventListener("click", async ()=>{

        saveJourney.disabled = true;

        saveJourney.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i> Saving...
        `;

        // Reuse the previous journey's id if one exists, so repeated
        // saves in this browser don't keep minting new ids - otherwise
        // generate a fresh one based on the current year.
        const previousRaw = localStorage.getItem("savedJourney");
        const previous = previousRaw ? JSON.parse(previousRaw) : null;
        const journeyId = (previous && previous.id)
            || `JL-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

        // FIX: previously this only stored totalBudget as a formatted
        // display string (e.g. "USD 420\n(LKR128,100)"), which the
        // My Journeys page couldn't actually use, so it fell back to a
        // hardcoded $420 / Rs.128,100 no matter what was really
        // selected here. Now we store the real numbers that were just
        // computed by updateBudget(), so every page reads the same
        // total.
        const savedJourney={

            id: journeyId,

            status: "Planned",

            date:new Date().toLocaleDateString(),

            destinations:selectedDestinations,

            partners:selectedPartners,

            partnerCount: selectedPartners.length,

            questionnaire:questionnaireData,

            budgetLKR: currentGrandTotalLKR,

            budgetUSD: convertToUSD(currentGrandTotalLKR),

            // Kept for backward compatibility with anything still
            // reading the old display-string field.
            totalBudget:totalBudget.innerText

        };

        // Always keep this local copy so "My Journeys" keeps working
        // for this browser even if the backend save below fails.
        localStorage.setItem(

            "savedJourney",

            JSON.stringify(savedJourney)

        );

        // Now try to save it as a real record on the backend so it
        // shows up correctly in Admin > Saved Journeys.
        await persistJourneyToBackend();

        saveMessage.style.display="block";

        saveJourney.innerHTML=`

            ✔ Journey Saved

        `;

        setTimeout(()=>{

            window.location.href=

            "my-journeys.html";

        },2500);

    });

}


// ======================================================
// PAGE INITIALIZATION
// ======================================================

loadPartners();


// ======================================================
// CONSOLE MESSAGE
// ======================================================

console.log(

"VISIT LANKA Journey Planner Loaded Successfully"

);