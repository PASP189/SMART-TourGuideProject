// ===============================
// VISIT LANKA ADMIN - MANAGE PARTNERS
// Now connected to Spring Boot backend
// ===============================
//
// NOTE: registrationNo and the uploaded license file are not stored on the
// backend yet (no matching fields/file storage exist), so they only live
// in this form visually and are not saved. Everything else on this form
// (name, business name, category, district, price, price unit, rating,
// image, features, covered destinations, email, phone, address,
// description, status) IS saved to the database.
//
// IMPORTANT: "Covered Destinations" is what travel-partners.html actually
// filters on. It must match the exact destination names from Manage
// Destinations (e.g. "Galle Fort", "Sigiriya Rock Fortress") - NOT just
// the district. That's why this form shows a live checklist of real
// destinations instead of only asking for a district.

const API_BASE = "http://localhost:8080/api";

let allDestinations = [];

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("partnerModal");
    const addBtn = document.getElementById("addPartner");
    const closeBtn = document.querySelector(".close");
    const form = document.getElementById("partnerForm");
    const searchInput = document.getElementById("searchPartner");
    const partnerCount = document.getElementById("partnerCount");
    const table = document.querySelector(".partner-table tbody");
    const destinationCheckboxes = document.getElementById("destinationCheckboxes");

    let editingId = null;

    // ===============================
    // PRICE DROPDOWN (LKR)
    // Keeps the visible #priceSelect / #priceCustom in sync with the
    // hidden #price field that the rest of this file reads from and
    // writes to on save/edit - so nothing else needs to change.
    // ===============================

    const priceSelectInput = document.getElementById("priceSelect");
    const priceCustomInput = document.getElementById("priceCustom");
    const priceHiddenInput = document.getElementById("price");

    function syncPriceHiddenField() {
        if (priceSelectInput.value === "custom") {
            priceCustomInput.style.display = "block";
            priceHiddenInput.value = priceCustomInput.value || "";
        } else {
            priceCustomInput.style.display = "none";
            priceHiddenInput.value = priceSelectInput.value;
        }
    }

    // Sets the dropdown + hidden field to match a saved partner's price
    // when opening the Edit modal. Falls back to "custom" if the stored
    // price doesn't match one of the preset options.
    function setPriceField(price) {

        const stringValue = price ? String(price) : "";

        if (!stringValue) {
            priceSelectInput.value = "5000";
            priceCustomInput.value = "";
            priceCustomInput.style.display = "none";
            priceHiddenInput.value = "5000";
            return;
        }

        const matchesOption = Array.from(priceSelectInput.options)
            .some(opt => opt.value === stringValue);

        if (matchesOption) {
            priceSelectInput.value = stringValue;
            priceCustomInput.value = "";
            priceCustomInput.style.display = "none";
        } else {
            priceSelectInput.value = "custom";
            priceCustomInput.value = stringValue;
            priceCustomInput.style.display = "block";
        }

        priceHiddenInput.value = stringValue;

    }

    if (priceSelectInput) {
        priceSelectInput.addEventListener("change", syncPriceHiddenField);
    }

    if (priceCustomInput) {
        priceCustomInput.addEventListener("input", syncPriceHiddenField);
    }

    // Initialize on first load
    syncPriceHiddenField();

    loadPartners();
    loadDestinationsForForm();

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            editingId = null;
            form.reset();
            setCheckedDestinations([]);
            showImagePreview("", "");
            setPriceField("");
            modal.style.display = "flex";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }


    // ===============================
    // COVERED DESTINATIONS CHECKLIST
    // ===============================

    async function loadDestinationsForForm() {

        try {

            const response = await fetch(`${API_BASE}/destinations`);
            if (!response.ok) throw new Error("Server responded with " + response.status);

            allDestinations = await response.json();

            if (!allDestinations.length) {
                destinationCheckboxes.innerHTML =
                    "<p class='empty-msg'>No destinations found yet. Add some in Manage Destinations first.</p>";
                return;
            }

            destinationCheckboxes.innerHTML = allDestinations.map(destination => `
                <label>
                    <input type="checkbox" class="destination-check" value="${destination.name}">
                    ${destination.name}
                </label>
            `).join("");

        } catch (err) {

            console.error("Failed to load destinations:", err);
            destinationCheckboxes.innerHTML =
                "<p class='empty-msg'>Could not load destinations. Is the backend running?</p>";

        }

    }

    function getCheckedDestinations() {
        return Array.from(document.querySelectorAll(".destination-check:checked"))
            .map(checkbox => checkbox.value);
    }

    function setCheckedDestinations(destinations) {
        const selected = (destinations || []).map(d => d.toLowerCase());
        document.querySelectorAll(".destination-check").forEach(checkbox => {
            checkbox.checked = selected.includes(checkbox.value.toLowerCase());
        });
    }


    // ===============================
    // IMAGE UPLOAD (real file picker -> backend -> preview)
    // ===============================

    const imageUploadInput = document.getElementById("imageUpload");
    const imageHiddenInput = document.getElementById("image");
    const imagePreviewWrap = document.getElementById("imagePreviewWrap");
    const imagePreview = document.getElementById("imagePreview");
    const imageUploadStatus = document.getElementById("imageUploadStatus");

    function showImagePreview(url, statusText) {
        if (!url) {
            imagePreviewWrap.style.display = "none";
            imagePreview.src = "";
            return;
        }
        imagePreview.src = url;
        imagePreviewWrap.style.display = "flex";
        imageUploadStatus.textContent = statusText || "";
    }

    if (imageUploadInput) {

        imageUploadInput.addEventListener("change", async () => {

            const file = imageUploadInput.files[0];
            if (!file) return;

            // Instant local preview while the upload is in progress
            const localUrl = URL.createObjectURL(file);
            showImagePreview(localUrl, "Uploading...");

            const formData = new FormData();
            formData.append("file", file);

            try {

                const response = await fetch(`${API_BASE}/uploads/image`, {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Upload failed");
                }

                imageHiddenInput.value = data.url;
                showImagePreview(data.url, "Uploaded ✓");

            } catch (err) {
                console.error("Image upload failed:", err);
                alert("Could not upload image: " + err.message);
                showImagePreview("", "");
                imageHiddenInput.value = "";
                imageUploadInput.value = "";
            }

        });

    }


    // ===============================
    // QUICK ACTIONS
    // ===============================

    const quickAddPartner = document.getElementById("quickAddPartner");
    const quickVerifyPartners = document.getElementById("quickVerifyPartners");
    const quickSendEmail = document.getElementById("quickSendEmail");
    const quickExportData = document.getElementById("quickExportData");

    if (quickAddPartner) {
        quickAddPartner.addEventListener("click", () => {
            editingId = null;
            form.reset();
            setCheckedDestinations([]);
            showImagePreview("", "");
            setPriceField("");
            modal.style.display = "flex";
        });
    }

    if (quickVerifyPartners) {
        quickVerifyPartners.addEventListener("click", () => {
            const pendingRow = document.querySelector(".partner-table .pending");
            if (pendingRow) {
                pendingRow.closest("tr").scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                alert("No pending partners right now.");
            }
        });
    }

    if (quickSendEmail) {
        quickSendEmail.addEventListener("click", async () => {

            try {

                const response = await fetch(`${API_BASE}/partners`);
                if (!response.ok) throw new Error("Server responded with " + response.status);

                const partners = await response.json();
                const emails = partners
                    .map(p => (p.email || "").trim())
                    .filter(email => email.includes("@"));

                if (emails.length === 0) {
                    alert("No partner email addresses are on file yet.");
                    return;
                }

                const recipients = emails.join(",");
                const subject = encodeURIComponent("VISIT LANKA - Partner Update");
                const body = encodeURIComponent(
                    "Hello,\n\nThis is a message from the VISIT LANKA Travel Partner Management System.\n\n"
                );

                window.location.href = `mailto:${recipients}?subject=${subject}&body=${body}`;

            } catch (err) {
                console.error("Failed to load partner emails:", err);
                alert("Could not load partner emails. Is the backend running?");
            }

        });
    }

    if (quickExportData) {
        quickExportData.addEventListener("click", exportPartnersToCSV);
    }

    const exportBtn = document.getElementById("exportPartners");
    const printBtn = document.getElementById("printPartners");

    if (exportBtn) {
        exportBtn.addEventListener("click", exportPartnersToCSV);
    }

    if (printBtn) {
        printBtn.addEventListener("click", () => {
            window.print();
        });
    }

    function exportPartnersToCSV() {
        const rows = document.querySelectorAll(".partner-table tbody tr");

        if (rows.length === 0) {
            alert("No partners to export.");
            return;
        }

        const header = ["Partner", "Business", "Category", "District", "Contact", "Status"];
        const csvRows = [header.join(",")];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const partner = cells[0] ? cells[0].innerText : "";
            const business = cells[1] ? cells[1].innerText : "";
            const category = cells[2] ? cells[2].innerText : "";
            const district = cells[3] ? cells[3].innerText : "";
            const contact = cells[4] ? cells[4].innerText : "";
            const status = cells[5] ? cells[5].innerText.trim() : "";

            const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;

            csvRows.push([partner, business, category, district, contact, status].map(escape).join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `visit-lanka-partners-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });


    async function loadPartners() {

        table.innerHTML = "<tr><td colspan='7'>Loading partners...</td></tr>";

        try {

            const response = await fetch(`${API_BASE}/partners`);
            if (!response.ok) throw new Error("Server responded with " + response.status);

            const partners = await response.json();
            renderTable(partners);

        } catch (err) {

            console.error("Failed to load partners:", err);
            table.innerHTML =
                "<tr><td colspan='7'>Could not load partners. " +
                "Make sure the backend server is running on localhost:8080.</td></tr>";

        }

    }


    function renderTable(partners) {

        table.innerHTML = "";

        partners.forEach(partner => {

            const row = document.createElement("tr");
            row.dataset.id = partner.id;

            row.innerHTML = `
    <td>${partner.name || "—"}</td>
    <td>${partner.businessName || ""}</td>
    <td>${partner.category || "—"}</td>
    <td>${partner.price ? partner.price + " / " + (partner.unit || "").replace("per_", "") : "—"}</td>
    <td>${partner.district || "—"}</td>
    <td>${partner.phone || partner.email || "—"}</td>
    <td>
        <span class="${partner.verified ? "verified" : "pending"}">
            ${partner.verified ? "Verified" : "Pending"}
        </span>
    </td>
    <td>
        <button class="verify"><i class="fa-solid fa-check"></i></button>
        <button class="edit"><i class="fa-solid fa-pen"></i></button>
        <button class="delete"><i class="fa-solid fa-trash"></i></button>
    </td>
`;

            table.appendChild(row);

        });

        updateCount();
        attachRowEvents();

    }


    if (form) {

        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            const districtValue = document.getElementById("district").value;
            const priceValue = document.getElementById("price").value;
            const ratingValue = document.getElementById("rating").value;
            const imageValue = document.getElementById("image").value;
            const featuresValue = document.getElementById("features").value;
            const coveredDestinations = getCheckedDestinations();

            if (coveredDestinations.length === 0) {
                alert("Please select at least one Covered Destination, or this partner will never appear on the Travel Partners page.");
                return;
            }

            const payload = {
                name: document.getElementById("partnerName").value,
                businessName: document.getElementById("businessName").value,
                category: document.getElementById("partnerCategory").value,
                district: districtValue,
                price: priceValue,                         // model expects String
                lkrPrice: parseFloat(priceValue) || 0,      // this is what travel-partners.js actually displays
                unit: document.getElementById("priceUnit").value,   // backend field is "unit"
                rating: ratingValue || "",
                image: imageValue || "",
                features: featuresValue
                    ? featuresValue.split(",").map(f => f.trim()).filter(Boolean)
                    : [],
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                address: document.getElementById("address").value,
                description: document.getElementById("description").value,
                verified: document.getElementById("status").value === "Verified",
                coveredDestinations: coveredDestinations   // real destination names, matched exactly on travel-partners.html
            };

            try {

                let response;

                if (editingId) {
                    response = await fetch(`${API_BASE}/partners/${editingId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                } else {
                    response = await fetch(`${API_BASE}/partners`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });
                }

                if (!response.ok) throw new Error("Server responded with " + response.status);

                alert(editingId
                    ? "Partner updated successfully."
                    : "Partner added successfully.");

                form.reset();
                setCheckedDestinations([]);
                showImagePreview("", "");
                setPriceField("");
                modal.style.display = "none";
                editingId = null;

                loadPartners();

            } catch (err) {
                console.error("Failed to save partner:", err);
                alert("Could not save partner. Is the backend running?");
            }

        });

    }


    function attachRowEvents() {

        document.querySelectorAll(".partner-table .verify").forEach(button => {

            button.onclick = async function () {

                const row = this.closest("tr");
                const id = row.dataset.id;

                try {

                    const getResp = await fetch(`${API_BASE}/partners/${id}`);
                    const partner = await getResp.json();
                    partner.verified = true;

                    const response = await fetch(`${API_BASE}/partners/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(partner)
                    });

                    if (!response.ok) throw new Error("Server responded with " + response.status);

                    loadPartners();

                } catch (err) {
                    alert("Could not verify partner.");
                }

            };

        });

        document.querySelectorAll(".partner-table .edit").forEach(button => {

            button.onclick = async function () {

                const row = this.closest("tr");
                const id = row.dataset.id;

                try {

                    const response = await fetch(`${API_BASE}/partners/${id}`);
                    if (!response.ok) throw new Error("Not found");

                    const partner = await response.json();

                    editingId = partner.id;
                    document.getElementById("partnerName").value = partner.name || "";
                    document.getElementById("businessName").value = partner.businessName || "";
                    document.getElementById("partnerCategory").value = partner.category || "";
                    document.getElementById("district").value = partner.district || "";
                    document.getElementById("email").value = partner.email || "";
                    document.getElementById("phone").value = partner.phone || "";
                    document.getElementById("address").value = partner.address || "";
                    document.getElementById("description").value = partner.description || "";
                    document.getElementById("status").value = partner.verified ? "Verified" : "Pending";
                    setPriceField(partner.price);
                    document.getElementById("priceUnit").value = partner.unit || "per_day";
                    document.getElementById("rating").value = partner.rating || "";
                    document.getElementById("image").value = partner.image || "";
                    showImagePreview(partner.image || "", partner.image ? "Current image" : "");
                    document.getElementById("features").value = (partner.features || []).join(", ");
                    setCheckedDestinations(partner.coveredDestinations);

                    modal.style.display = "flex";

                } catch (err) {
                    alert("Could not load partner details for editing.");
                }

            };

        });

        document.querySelectorAll(".partner-table .delete").forEach(button => {

            button.onclick = async function () {

                const row = this.closest("tr");
                const id = row.dataset.id;
                const name = row.cells[0].innerText;

                if (!confirm("Delete " + name + " ?")) return;

                try {

                    const response = await fetch(`${API_BASE}/partners/${id}`, {
                        method: "DELETE"
                    });

                    if (!response.ok) throw new Error("Server responded with " + response.status);

                    row.remove();
                    updateCount();

                } catch (err) {
                    alert("Could not delete partner. Is the backend running?");
                }

            };

        });

    }


    if (searchInput) {

        searchInput.addEventListener("keyup", () => {

            const value = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll(".partner-table tbody tr");

            rows.forEach(row => {
                row.style.display =
                    row.innerText.toLowerCase().includes(value) ? "" : "none";
            });

        });

    }


    function updateCount() {
        const total = document.querySelectorAll(".partner-table tbody tr").length;
        if (partnerCount) partnerCount.innerText = total;
    }

    console.log("VISIT LANKA Admin Partner Management Loaded");

});