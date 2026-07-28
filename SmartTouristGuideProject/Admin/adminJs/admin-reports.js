// ===============================
// VISIT LANKA ADMIN - REPORTS
// Now connected to Spring Boot backend
// ===============================
//
// NOTE: the PDF/Excel export, print, and per-report "generate" buttons on
// this page are not built on the backend (no report-generation endpoint
// exists yet), so they remain visual only for now. The four overview
// cards at the top and the record count ARE real, live numbers pulled
// from the database.

const API_BASE = "http://localhost:8080/api";

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

    loadOverviewCounts();
    loadTransactionSummary();

    // -------------------------------
    // Report table "View" buttons -> open report summary modal
    // -------------------------------

    const reportModal = document.getElementById("reportModal");
    const closeReportModal = reportModal ? reportModal.querySelector(".close") : null;

    document.querySelectorAll(".report-table .view").forEach(button => {

        button.addEventListener("click", function () {

            const row = this.closest("tr");
            const reportName = row.cells[0].innerText;
            const records = row.cells[1].innerText;
            const updated = row.cells[2].innerText;
            const status = row.cells[3].innerText;

            const nameEl = document.getElementById("reportName");
            const recordsEl = document.getElementById("reportRecords");
            const generatedEl = document.getElementById("reportGenerated");
            const statusEl = document.getElementById("reportStatus");
            const descriptionEl = document.getElementById("reportDescription");

            if (nameEl) nameEl.innerText = reportName;
            if (recordsEl) recordsEl.innerText = records;
            if (generatedEl) generatedEl.innerText = updated;
            if (statusEl) statusEl.innerText = status;

            if (descriptionEl) {
                descriptionEl.innerText =
                    `This report summarizes ${reportName.toLowerCase()}, covering ${records} records as of ${updated.toLowerCase()}.`;
            }

            if (reportModal) reportModal.style.display = "flex";

        });

    });


    // ===============================
// CUSTOM DATE PICKER
// ===============================

(function setupDatePicker() {

    const input = document.getElementById("reportDate");
    const picker = document.getElementById("customDatepicker");
    if (!input || !picker) return;

    const monthLabel = document.getElementById("dpMonthLabel");
    const daysGrid = document.getElementById("dpDays");
    const prevBtn = document.getElementById("dpPrevMonth");
    const nextBtn = document.getElementById("dpNextMonth");
    const todayBtn = document.getElementById("dpToday");
    const clearBtn = document.getElementById("dpClear");

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

    let viewDate = new Date();
    let selectedDate = null;

    function render() {

        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        monthLabel.innerText = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const today = new Date();
        today.setHours(0,0,0,0);

        daysGrid.innerHTML = "";

        for (let i = firstDay - 1; i >= 0; i--) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "dp-muted";
            btn.innerText = daysInPrevMonth - i;
            btn.disabled = true;
            daysGrid.appendChild(btn);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.innerText = d;

            const thisDate = new Date(year, month, d);
            thisDate.setHours(0,0,0,0);

            if (thisDate.getTime() === today.getTime()) {
                btn.classList.add("dp-today");
            }

            if (selectedDate && thisDate.getTime() === selectedDate.getTime()) {
                btn.classList.add("dp-selected");
            }

            btn.addEventListener("click", () => {
                selectedDate = thisDate;
                input.value = thisDate.toLocaleDateString();
                render();
                picker.classList.remove("show");
            });

            daysGrid.appendChild(btn);
        }

    }

    input.addEventListener("click", () => {
        picker.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!picker.contains(e.target) && e.target !== input) {
            picker.classList.remove("show");
        }
    });

    prevBtn.addEventListener("click", () => {
        viewDate.setMonth(viewDate.getMonth() - 1);
        render();
    });

    nextBtn.addEventListener("click", () => {
        viewDate.setMonth(viewDate.getMonth() + 1);
        render();
    });

    todayBtn.addEventListener("click", () => {
        const today = new Date();
        today.setHours(0,0,0,0);
        selectedDate = today;
        viewDate = new Date();
        input.value = today.toLocaleDateString();
        render();
        picker.classList.remove("show");
    });

    clearBtn.addEventListener("click", () => {
        selectedDate = null;
        input.value = "";
        render();
    });

    render();

})();

    if (closeReportModal) {
        closeReportModal.addEventListener("click", () => {
            reportModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (reportModal && e.target === reportModal) {
            reportModal.style.display = "none";
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && reportModal) {
            reportModal.style.display = "none";
        }
    });

    // -------------------------------
    // Toolbar: Download PDF / Export Excel / Print Report
    // -------------------------------

    const downloadPDFBtn = document.getElementById("downloadPDF");
    const downloadExcelBtn = document.getElementById("downloadExcel");
    const printReportBtn = document.getElementById("printReport");

    if (printReportBtn) {
        printReportBtn.addEventListener("click", () => {
            window.print();
        });
    }

    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener("click", exportReportsToCSV);
    }

    if (downloadPDFBtn) {
        downloadPDFBtn.addEventListener("click", generateReportsPDF);
    }

    function generateReportsPDF() {

        if (!window.jspdf) {
            showToast("PDF library failed to load. Check your internet connection and try again.", "error");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setTextColor(20, 40, 70);
        doc.text("VISIT LANKA - Reports & Analytics", 14, 20);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

        const overviewY = 40;
        doc.setFontSize(13);
        doc.setTextColor(20, 40, 70);
        doc.text("Overview", 14, overviewY);

        const overviewData = [
            ["Total Users", document.getElementById("repUserCount")?.textContent || "—"],
            ["Destinations", document.getElementById("repDestCount")?.textContent || "—"],
            ["Travel Partners", document.getElementById("repPartnerCount")?.textContent || "—"],
            ["Reviews", document.getElementById("repReviewCount")?.textContent || "—"]
        ];

        let y = overviewY + 8;
        doc.setFontSize(11);
        overviewData.forEach(([label, value]) => {
            doc.setTextColor(80);
            doc.text(label + ":", 14, y);
            doc.setTextColor(20, 40, 70);
            doc.text(String(value), 70, y);
            y += 7;
        });

        y += 8;
        doc.setFontSize(13);
        doc.setTextColor(20, 40, 70);
        doc.text("Available Reports", 14, y);
        y += 10;

        const rows = document.querySelectorAll(".report-table tbody tr");

        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(20, 40, 70);
        doc.rect(14, y - 5, 182, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.text("Report", 16, y);
        doc.text("Records", 90, y);
        doc.text("Updated", 125, y);
        doc.text("Status", 160, y);
        y += 8;

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const name = cells[0] ? cells[0].innerText : "";
            const records = cells[1] ? cells[1].innerText : "";
            const updated = cells[2] ? cells[2].innerText : "";
            const status = cells[3] ? cells[3].innerText : "";

            doc.setTextColor(30);
            doc.text(name, 16, y);
            doc.text(records, 90, y);
            doc.text(updated, 125, y);
            doc.text(status, 160, y);
            y += 7;
        });

        doc.save(`visit-lanka-reports-${new Date().toISOString().slice(0, 10)}.pdf`);

        showToast("PDF report downloaded successfully.");
    }

    function exportReportsToCSV() {

        const rows = document.querySelectorAll(".report-table tbody tr");

        if (rows.length === 0) {
            showToast("No reports to export.", "error");
            return;
        }

        const header = ["Report", "Records", "Updated", "Status"];
        const csvRows = [header.join(",")];

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            const values = [
                cells[0] ? cells[0].innerText : "",
                cells[1] ? cells[1].innerText : "",
                cells[2] ? cells[2].innerText : "",
                cells[3] ? cells[3].innerText : ""
            ];

            const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;

            csvRows.push(values.map(escape).join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `visit-lanka-reports-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Reports exported successfully.");
    }

    // Modal export buttons — reuse the same real export/print functions as the toolbar
    const modalPrintBtn = document.querySelector("#reportModal .print-btn");
    const modalPdfBtn = document.querySelector("#reportModal .pdf-btn");
    const modalExcelBtn = document.querySelector("#reportModal .excel-btn");

    if (modalPrintBtn) {
        modalPrintBtn.addEventListener("click", () => {
            window.print();
        });
    }

    if (modalPdfBtn) {
        modalPdfBtn.addEventListener("click", generateReportsPDF);
    }

    if (modalExcelBtn) {
        modalExcelBtn.addEventListener("click", exportReportsToCSV);
    }

    // -------------------------------
    // Activity carousel (unchanged - not backend data)
    // -------------------------------

    const track = document.querySelector(".activity-track");
    const cards = document.querySelectorAll(".activity-card");
    const next = document.getElementById("nextActivity");
    const prev = document.getElementById("prevActivity");
    let index = 0;

    function updateSlider() {
        if (track) track.style.transform = `translateX(-${index * 100}%)`;
    }

    if (next) {
        next.onclick = function () {
            index++;
            if (index >= cards.length) index = 0;
            updateSlider();
        };
    }

    if (prev) {
        prev.onclick = function () {
            index--;
            if (index < 0) index = cards.length - 1;
            updateSlider();
        };
    }

    // -------------------------------
    // Quick action cards
    // -------------------------------

    document.querySelectorAll(".quick-card").forEach(card => {

        card.addEventListener("click", () => {

            const titleEl = card.querySelector("h3");
            const title = titleEl ? titleEl.innerText : "";

            switch (title) {
                case "View Reports":
                    document.querySelector(".table-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    break;
                case "Analytics":
                    showToast("A dedicated analytics dashboard isn't built yet.", "info");
                    break;
                case "Export Data":
                    exportReportsToCSV();
                    break;
                case "Filter Reports":
                    document.getElementById("reportDate")?.focus();
                    showToast("Pick a date above to filter — full date filtering isn't built yet.", "info", 3500);
                    break;
            }

        });

    });

    document.querySelectorAll(".pagination button").forEach(button => {

        button.addEventListener("click", () => {

            document.querySelectorAll(".pagination button").forEach(btn => {
                btn.classList.remove("active-page");
            });

            if (button.textContent.trim() !== "") {
                button.classList.add("active-page");
            }

        });

    });

    console.log("VISIT LANKA Reports Module Loaded");

});


// ===============================
// REAL COUNTS FOR THE 4 OVERVIEW CARDS
// ===============================

async function loadOverviewCounts() {

    fetchCount(`${API_BASE}/users`, "repUserCount");
    fetchCount(`${API_BASE}/destinations`, "repDestCount");
    fetchCount(`${API_BASE}/partners`, "repPartnerCount");
    fetchCount(`${API_BASE}/reviews`, "repReviewCount");

}


async function fetchCount(url, elementId) {

    const el = document.getElementById(elementId);
    if (!el) return;

    try {

        const response = await fetch(url);
        if (!response.ok) throw new Error("Server responded with " + response.status);

        const data = await response.json();
        el.textContent = data.length.toLocaleString();

    } catch (err) {
        console.error("Failed to load count for " + elementId, err);
        el.textContent = "—";
    }

}


// ===============================
// REAL BOOKING/REVENUE SUMMARY FROM REFERRAL TRANSACTIONS
// ===============================

async function loadTransactionSummary() {

    const recordsEl = document.getElementById("reportRecords");
    if (!recordsEl) return;

    try {

        const response = await fetch(`${API_BASE}/referrals`);
        if (!response.ok) throw new Error("Server responded with " + response.status);

        const transactions = await response.json();

        recordsEl.textContent = transactions.length.toLocaleString();

        const confirmed = transactions.filter(t => t.status === "CONFIRMED");
        const totalRevenue = confirmed.reduce((sum, t) => sum + (t.feeAmount || 0), 0);

        console.log(
            `Referral summary: ${transactions.length} total, ` +
            `${confirmed.length} confirmed, revenue $${totalRevenue.toFixed(2)}`
        );

    } catch (err) {
        console.error("Failed to load transaction summary:", err);
        recordsEl.textContent = "—";
    }

}