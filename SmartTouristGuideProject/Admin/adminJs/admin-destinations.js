// ===============================
// VISIT LANKA ADMIN - MANAGE DESTINATIONS
// Now connected to Spring Boot backend
// ===============================

const API_BASE = "http://localhost:8080/api";

// This page lives at Admin/adminhtml/manage-destinations.html, so the
// images folder (at project root) is two levels up.
const PLACEHOLDER_IMAGE = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
  <rect width="200" height="150" fill="#1e2a3a"/>
  <g fill="#5a6b7d">
    <path d="M70 55 h60 a8 8 0 0 1 8 8 v34 a8 8 0 0 1 -8 8 h-60 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8 z" fill="none" stroke="#5a6b7d" stroke-width="3"/>
    <circle cx="85" cy="70" r="6"/>
    <path d="M62 95 l22 -20 l16 14 l14 -16 l24 22" fill="none" stroke="#5a6b7d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <text x="100" y="120" font-family="Arial, sans-serif" font-size="11" fill="#8a97a6" text-anchor="middle">No Image</text>
</svg>
`);

// ===============================
// TOAST NOTIFICATION HELPER
// ===============================

function showToast(message, type = "success", duration = 2500) {

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon = type === "error"
        ? "fa-circle-exclamation"
        : type === "info"
        ? "fa-circle-info"
        : "fa-circle-check";

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;

    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, duration);

}

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("destinationModal");
    const addBtn = document.getElementById("addDestination");
    const exportBtn = document.getElementById("exportDestinations");
    const printBtn = document.getElementById("printDestinations");
    const closeBtn = document.querySelector(".close");
    const form = document.getElementById("destinationForm");
    const imageUpload = document.getElementById("imageUpload");
    const previewImage = document.getElementById("previewImage");
    const searchInput = document.getElementById("searchDestination");
    const destinationCount = document.getElementById("destinationCount");
    const table = document.querySelector(".destination-table tbody");

    const destinationNameInput = document.getElementById("destinationName");
    const categoryInput = document.getElementById("category");
    const provinceInput = document.getElementById("province");
    const districtInput = document.getElementById("district");
    const descriptionInput = document.getElementById("description");
    const mapLinkInput = document.getElementById("mapLink");
    const openingHoursInput = document.getElementById("openingHours");
   const safetyInput = document.getElementById("safety");
    const featuredInput = document.getElementById("featured");

    // Currency + single price field (replaces the old dual USD/LKR fields
    // so a destination is priced in exactly one currency, never both).
    const priceCurrencyInput = document.getElementById("priceCurrency");
    const priceValueWrap = document.getElementById("priceValueWrap");
    const priceValueLabel = document.getElementById("priceValueLabel");
    const priceValueInput = document.getElementById("priceValue");
    const priceValueCustomInput = document.getElementById("priceValueCustom");

    const PRICE_OPTIONS = {
        USD: [
            { value: "5", label: "$5" },
            { value: "10", label: "$10" },
            { value: "20", label: "$20" },
            { value: "35", label: "$35" },
            { value: "50", label: "$50" },
            { value: "custom", label: "Custom Amount" }
        ],
        LKR: [
            { value: "1500", label: "Rs. 1,500" },
            { value: "3000", label: "Rs. 3,000" },
            { value: "6000", label: "Rs. 6,000" },
            { value: "10500", label: "Rs. 10,500" },
            { value: "15000", label: "Rs. 15,000" },
            { value: "custom", label: "Custom Amount" }
        ]
    };

    function rebuildPriceOptions(currency, selectedValue) {
        priceValueInput.innerHTML = PRICE_OPTIONS[currency]
            .map(opt => `<option value="${opt.value}">${opt.label}</option>`)
            .join("");
        if (selectedValue !== undefined) {
            priceValueInput.value = selectedValue;
        }
    }

    function applyCurrencyMode() {
        const currency = priceCurrencyInput.value;

        if (currency === "free") {
            priceValueWrap.style.display = "none";
            priceValueCustomInput.style.display = "none";
            return;
        }

        priceValueWrap.style.display = "flex";
        priceValueLabel.innerText = currency === "USD"
            ? "Ticket Price (USD)"
            : "Ticket Price (Rs.)";
        rebuildPriceOptions(currency);
        priceValueCustomInput.style.display =
            priceValueInput.value === "custom" ? "block" : "none";
    }

    if (priceCurrencyInput) {
        priceCurrencyInput.addEventListener("change", applyCurrencyMode);
        applyCurrencyMode(); // initialize on page load
    }

    if (priceValueInput) {
        priceValueInput.addEventListener("change", () => {
            priceValueCustomInput.style.display =
                priceValueInput.value === "custom" ? "block" : "none";
        });
    }
    let editingId = null; // null = creating new, otherwise editing this id

    if (previewImage) {
        previewImage.src = PLACEHOLDER_IMAGE;
    }

    loadDestinations();

    // ===============================
    // MODAL OPEN / CLOSE
    // ===============================

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            editingId = null;
            form.reset();
            previewImage.src = PLACEHOLDER_IMAGE;
            modal.style.display = "flex";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    if (imageUpload) {
        imageUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    previewImage.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ===============================
    // EXPORT / PRINT
    // ===============================

    if (exportBtn) {
        exportBtn.addEventListener("click", exportDestinationsToCSV);
    }

    if (printBtn) {
        printBtn.addEventListener("click", () => {
            window.print();
        });
    }

    function exportDestinationsToCSV() {

        const rows = document.querySelectorAll(".destination-table tbody tr");

        if (rows.length === 0) {
            showToast("No destinations to export.", "error");
            return;
        }

        const header = ["Name", "District", "Category", "Ticket", "Featured", "Status"];
        const csvRows = [header.join(",")];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length < 7) return; // skip loading/error placeholder rows

            const name = cells[1] ? cells[1].innerText : "";
            const district = cells[2] ? cells[2].innerText : "";
            const category = cells[3] ? cells[3].innerText : "";
            const ticket = cells[4] ? cells[4].innerText : "";
            const featured = cells[5] ? cells[5].innerText : "";
            const status = cells[6] ? cells[6].innerText.trim() : "";

            const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;

            csvRows.push([name, district, category, ticket, featured, status].map(escape).join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `visit-lanka-destinations-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Destinations exported successfully.");

    }

    // ===============================
    // LOAD ALL DESTINATIONS FROM BACKEND
    // ===============================

    async function loadDestinations() {

        table.innerHTML =
            "<tr><td colspan='8'>Loading destinations...</td></tr>";

        try {

            const response = await fetch(`${API_BASE}/destinations`);

            if (!response.ok) {
                throw new Error("Server responded with " + response.status);
            }

            const destinations = await response.json();
            renderTable(destinations);

        } catch (err) {

            console.error("Failed to load destinations:", err);
            table.innerHTML =
                "<tr><td colspan='8'>Could not load destinations. " +
                "Make sure the backend server is running on localhost:8080.</td></tr>";

        }

    }


    function formatTicket(dest) {

        const hasUsd = dest.usdPrice !== null && dest.usdPrice !== undefined;
        const hasLkr = dest.lkrPrice !== null && dest.lkrPrice !== undefined;

        if (!hasUsd && !hasLkr) return "Free";

        const parts = [];
        if (hasUsd) parts.push(`$${dest.usdPrice}`);
        if (hasLkr) parts.push(`Rs.${dest.lkrPrice}`);

        return parts.join(" / ");

    }


    function renderTable(destinations) {

        table.innerHTML = "";

        if (destinations.length === 0) {
            table.innerHTML = "<tr><td colspan='8'>No destinations yet.</td></tr>";
            updateCount();
            return;
        }

        destinations.forEach(dest => {

            const row = document.createElement("tr");
            row.dataset.id = dest.id;

            const category = (dest.themeTags && dest.themeTags[0]) || "—";
            const district = dest.district || "—";
            const ticket = formatTicket(dest);
            const featured = dest.featured ? "Yes" : "No";

            const image = isUsableImageUrl(dest.imageUrl)
                ? dest.imageUrl
                : PLACEHOLDER_IMAGE;

            row.innerHTML = `
                <td><img src="${image}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMAGE}';"></td>
                <td>${dest.name || ""}</td>
                <td>${district}</td>
                <td>${category}</td>
                <td>${ticket}</td>
                <td>${featured}</td>
                <td>
                    <span class="active">Published</span>
                </td>
                <td>
                    <button class="edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;

            table.appendChild(row);

        });

        updateCount();
        attachRowEvents();

    }


    function isUsableImageUrl(url) {
        if (!url) return false;
        return (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("data:") ||
            url.startsWith("/")
        );
    }


    function parseOptionalNumber(value) {
        if (value === null || value === undefined) return null;
        const trimmed = String(value).trim();
        if (trimmed === "") return null;
        const num = Number(trimmed);
        return Number.isNaN(num) ? null : num;
    }
    
function resolvePrice(selectEl, customEl) {
    if (selectEl.value === "custom") {
        return parseOptionalNumber(customEl.value);
    }
    return parseOptionalNumber(selectEl.value);
}

// Returns { usdPrice, lkrPrice } with exactly one of them set (or both
// null for "Free"), based on the single currency + price field.
function resolveCurrencyPrice() {
    const currency = priceCurrencyInput.value;

    if (currency === "free") {
        return { usdPrice: null, lkrPrice: null };
    }

    const amount = resolvePrice(priceValueInput, priceValueCustomInput);

    return currency === "USD"
        ? { usdPrice: amount, lkrPrice: null }
        : { usdPrice: null, lkrPrice: amount };
}

// Populates the currency + price field when editing an existing
// destination, based on whichever of usdPrice/lkrPrice is actually set.
function setCurrencyPriceField(usdPrice, lkrPrice) {

    const hasUsd = usdPrice !== null && usdPrice !== undefined;
    const hasLkr = lkrPrice !== null && lkrPrice !== undefined;

    if (!hasUsd && !hasLkr) {
        priceCurrencyInput.value = "free";
        applyCurrencyMode();
        return;
    }

    const currency = hasUsd ? "USD" : "LKR";
    const value = hasUsd ? usdPrice : lkrPrice;

    priceCurrencyInput.value = currency;
    applyCurrencyMode();

    const stringValue = String(value);
    const matchesOption = Array.from(priceValueInput.options).some(opt => opt.value === stringValue);

    if (matchesOption) {
        priceValueInput.value = stringValue;
        priceValueCustomInput.style.display = "none";
    } else {
        priceValueInput.value = "custom";
        priceValueCustomInput.value = value;
        priceValueCustomInput.style.display = "block";
    }

}

    // ===============================
    // CREATE / UPDATE
    // ===============================

    if (form) {

        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            const name = destinationNameInput.value;
            const category = categoryInput.value;
            const description = descriptionInput.value;

            let imageUrl = "";
            if (previewImage.src === PLACEHOLDER_IMAGE || previewImage.src.endsWith("image-placeholder.png")) {
                imageUrl = "";
            } else if (previewImage.src.startsWith("data:")) {
                imageUrl = ""; // don't try to save a giant base64 string to the database
            } else if (isUsableImageUrl(previewImage.src)) {
                imageUrl = previewImage.src;
            }

            const payload = {
                name: name,
                description: description,
                imageUrl: imageUrl,
                themeTags: category ? [category] : [],
                latitude: 0,
                longitude: 0,
                province: provinceInput.value,
                district: districtInput.value,
                mapLink: mapLinkInput.value,
                openingHours: openingHoursInput.value,
           ...resolveCurrencyPrice(),
                safetyLevel: safetyInput.value,
                featured: featuredInput.value === "Yes"
            };

            try {

                let response;

                if (editingId) {
                    response = await fetch(`${API_BASE}/destinations/${editingId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await fetch(`${API_BASE}/destinations`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                }

                if (!response.ok) {
                    throw new Error("Server responded with " + response.status);
                }

               showToast(editingId
                    ? "Destination updated successfully."
                    : "Destination added successfully.");

                form.reset();
                previewImage.src = PLACEHOLDER_IMAGE;
                modal.style.display = "none";
                editingId = null;

                priceCurrencyInput.value = "USD";
                priceValueCustomInput.value = "";
                applyCurrencyMode();

                loadDestinations();
            } catch (err) {

                console.error("Failed to save destination:", err);
                showToast("Could not save destination. Is the backend running?", "error");

            }

        });

    }


    // ===============================
    // EDIT / DELETE (attached fresh after every render)
    // ===============================

    function attachRowEvents() {

        document.querySelectorAll(".destination-table .edit").forEach(button => {

            button.onclick = async function () {

                const row = this.closest("tr");
                const id = row.dataset.id;

                try {

                    const response = await fetch(`${API_BASE}/destinations/${id}`);
                    if (!response.ok) throw new Error("Not found");

                    const dest = await response.json();

                    editingId = dest.id;
                    destinationNameInput.value = dest.name || "";
                    descriptionInput.value = dest.description || "";

                    if (dest.themeTags && dest.themeTags[0]) {
                        categoryInput.value = dest.themeTags[0];
                    }

                    provinceInput.value = dest.province || provinceInput.value;
                    districtInput.value = dest.district || "";
                    mapLinkInput.value = dest.mapLink || "";
                    openingHoursInput.value = dest.openingHours || "";
setCurrencyPriceField(dest.usdPrice, dest.lkrPrice);
                    safetyInput.value = dest.safetyLevel || safetyInput.value;
                    featuredInput.value = dest.featured ? "Yes" : "No";

                    previewImage.src = isUsableImageUrl(dest.imageUrl)
                        ? dest.imageUrl
                        : PLACEHOLDER_IMAGE;

                    modal.style.display = "flex";

                } catch (err) {
                    showToast("Could not load destination details for editing.", "error");
                }

            };

        });

        document.querySelectorAll(".destination-table .delete").forEach(button => {

            button.onclick = async function () {

                const row = this.closest("tr");
                const id = row.dataset.id;
                const name = row.cells[1].innerText;

                if (!confirm("Delete " + name + " ?")) return;

                try {

                    const response = await fetch(`${API_BASE}/destinations/${id}`, {
                        method: "DELETE"
                    });

                    if (!response.ok) {
                        throw new Error("Server responded with " + response.status);
                    }

                    row.remove();
                    updateCount();
                    showToast(name + " deleted successfully.");

                } catch (err) {
                    console.error("Failed to delete destination:", err);
                    showToast("Could not delete destination. Is the backend running?", "error");
                }

            };

        });

    }


    if (searchInput) {

        searchInput.addEventListener("keyup", () => {

            const value = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll(".destination-table tbody tr");

            rows.forEach(row => {
                row.style.display =
                    row.innerText.toLowerCase().includes(value) ? "" : "none";
            });

        });

    }


    function updateCount() {

        const total = document.querySelectorAll(".destination-table tbody tr").length;
        if (destinationCount) {
            destinationCount.innerText = total;
        }

    }


    // Quick action cards
    document.querySelectorAll(".quick-card").forEach(card => {

        card.addEventListener("click", () => {

            const title = card.querySelector("h3").innerText;

            switch (title) {
                case "Add Destination":
                    editingId = null;
                    form.reset();
                    previewImage.src = PLACEHOLDER_IMAGE;
                    modal.style.display = "flex";

                    priceCurrencyInput.value = "USD";
                priceValueCustomInput.value = "";
                applyCurrencyMode();

                    break;
                case "Manage Images":
                    showToast("Image gallery management isn't built yet.", "info");
                    break;
                case "Featured Places":
                    showToast("Featured destination flagging isn't built yet.", "info");
                    break;
                case "Export Data":
                    exportDestinationsToCSV();
                    break;
            }

        });

    });

    console.log("VISIT LANKA Admin Destination Management Loaded");

});