// ===============================
// VISIT LANKA ADMIN - MANAGE USERS
// Now connected to Spring Boot backend
// ===============================

const API_BASE = "http://localhost:8080/api";

document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("addUserModal");
    const modalTitle = document.getElementById("userModalTitle");
    const saveBtn = document.getElementById("userSaveBtn");
    const passwordLabel = document.getElementById("passwordLabel");
    const addBtn = document.getElementById("addUser");
    const closeBtn = document.querySelector(".close");
    const form = document.getElementById("userForm");
    const searchInput = document.getElementById("searchUser");
    const totalUsers = document.getElementById("totalUsers");
    const table = document.querySelector(".users-table tbody");

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const roleInput = document.getElementById("role");

    let editingId = null; // null = creating a new user, otherwise editing this id

    loadUsers();

    if (addBtn) {
        addBtn.addEventListener("click", () => {
            openModalForCreate();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }
const exportBtn = document.getElementById("exportUsers");
    const printBtn = document.getElementById("printUsers");

    if (exportBtn) {
        exportBtn.addEventListener("click", exportUsersToCSV);
    }

    if (printBtn) {
        printBtn.addEventListener("click", () => {
            window.print();
        });
    }

    // ===== QUICK ACTIONS PANEL =====
    const qaAddUser = document.getElementById("qaAddUser");
    const qaBlockUser = document.getElementById("qaBlockUser");
    const qaSendEmail = document.getElementById("qaSendEmail");
    const qaExportUsers = document.getElementById("qaExportUsers");

    // Add User -> reuse the same modal as the toolbar button
    if (qaAddUser) {
        qaAddUser.addEventListener("click", () => {
            openModalForCreate();
        });
    }

    // Export Users -> reuse the same CSV export as the toolbar button
    if (qaExportUsers) {
        qaExportUsers.addEventListener("click", exportUsersToCSV);
    }

    // Block User -> ask which user, then toggle their status
    if (qaBlockUser) {
        qaBlockUser.addEventListener("click", async () => {
            const idInput = prompt("Enter the User ID to block/unblock (e.g. U001):");
            if (!idInput) return;

            const numericId = idInput.replace(/\D/g, ""); // strip "U" prefix, keep digits
            const row = document.querySelector(`.users-table tbody tr[data-id="${Number(numericId)}"]`);

            if (!row) {
                alert("No user found with that ID.");
                return;
            }

            const statusCell = row.querySelector("td:nth-child(5) span");
            const isCurrentlyBlocked = statusCell.innerText.trim() === "Blocked";
            const newStatus = isCurrentlyBlocked ? "Active" : "Blocked";

            try {
                const response = await fetch(`${API_BASE}/users/${numericId}/status`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: newStatus })
                });

                if (!response.ok) throw new Error("Server responded with " + response.status);

                statusCell.innerText = newStatus;
                statusCell.className = newStatus === "Blocked" ? "blocked" : "active";

                alert(`User ${idInput} is now ${newStatus}.`);

            } catch (err) {
                console.error("Failed to update status:", err);
                alert("Could not update user status. Is the backend running and does /users/{id}/status exist?");
            }
        });
    }

    // Send Email -> opens the user's default mail app with all user emails BCC'd
    if (qaSendEmail) {
        qaSendEmail.addEventListener("click", () => {
            const rows = document.querySelectorAll(".users-table tbody tr");

            if (rows.length === 0) {
                alert("No users to email.");
                return;
            }

            const emails = Array.from(rows)
                .map(row => row.children[2]?.innerText.trim())
                .filter(email => email && email.includes("@"));

            if (emails.length === 0) {
                alert("No valid email addresses found.");
                return;
            }

            const subject = encodeURIComponent("VISIT LANKA Notification");
            const body = encodeURIComponent("Hello,\n\n");
            const bcc = encodeURIComponent(emails.join(","));

            window.location.href = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
        });
    }
    function exportUsersToCSV() {
        const rows = document.querySelectorAll(".users-table tbody tr");

        if (rows.length === 0) {
            alert("No users to export.");
            return;
        }

        const header = ["ID", "Name", "Email", "Username", "Status"];
        const csvRows = [header.join(",")];

        rows.forEach(row => {
            const id = row.dataset.id ? `U${String(row.dataset.id).padStart(3, "0")}` : row.children[0].innerText;
            const name = row.querySelector("h4") ? row.querySelector("h4").innerText : "";
            const email = row.children[2] ? row.children[2].innerText : "";
            const username = row.children[3] ? row.children[3].innerText : "";
            const status = row.children[4] ? row.children[4].innerText.trim() : "";

            const escape = (val) => `"${String(val).replace(/"/g, '""')}"`;

            csvRows.push([id, name, email, username, status].map(escape).join(","));
        });

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `visit-lanka-users-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    window.addEventListener("click", (e) => {
        if (e.target === modal) modal.style.display = "none";
    });


    function openModalForCreate() {
        editingId = null;
        form.reset();
        modalTitle.innerText = "Add New User";
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save User';
        passwordLabel.innerText = "Password";
        passwordInput.placeholder = "Enter Password";
        modal.style.display = "flex";
    }

    function openModalForEdit(user) {
        editingId = user.id;
        fullNameInput.value = user.name || "";
        emailInput.value = user.email || "";
        usernameInput.value = user.username || "";
        passwordInput.value = "";
        roleInput.value = (user.role || "User").toLowerCase() === "admin" ? "Admin" : "User";
        modalTitle.innerText = "Edit User";
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Update User';
        passwordLabel.innerText = "Password (leave blank to keep current)";
        passwordInput.placeholder = "Leave blank to keep current password";
        modal.style.display = "flex";
    }


    async function loadUsers() {

        table.innerHTML = "<tr><td colspan='6'>Loading users...</td></tr>";

        try {

            const response = await fetch(`${API_BASE}/users`);
            if (!response.ok) throw new Error("Server responded with " + response.status);

            const users = await response.json();
            renderTable(users);

        } catch (err) {

            console.error("Failed to load users:", err);
            table.innerHTML =
                "<tr><td colspan='6'>Could not load users. " +
                "Make sure the backend server is running on localhost:8080.</td></tr>";

        }

    }


    function renderTable(users) {

        table.innerHTML = "";

        users.forEach(user => {

            const row = document.createElement("tr");
            row.dataset.id = user.id;

            const isAdmin = (user.role || "").toLowerCase() === "admin";

            const avatarClass = isAdmin ? "admin-color" : "user-color";
            const avatarIcon = isAdmin ? "fa-user-shield" : "fa-user";
            const roleLabel = isAdmin ? "Administrator" : "User";
            const statusClass = isAdmin ? "admin" : "active";
            const statusLabel = isAdmin ? "Admin" : "Active";
            const usernameLabel = user.username && user.username.trim() !== ""
                ? user.username
                : "—";

            row.innerHTML = `
                <td>U${String(user.id).padStart(3, "0")}</td>
                <td>
                    <div class="user-info">
                        <div class="user-avatar ${avatarClass}">
                            <i class="fa-solid ${avatarIcon}"></i>
                        </div>
                        <div>
                            <h4>${user.name || ""}</h4>
                            <p>${roleLabel}</p>
                        </div>
                    </div>
                </td>
                <td>${user.email || ""}</td>
                <td>${usernameLabel}</td>
                <td><span class="${statusClass}">${statusLabel}</span></td>
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


    if (form) {

        form.addEventListener("submit", async (e) => {

            e.preventDefault();

            const name = fullNameInput.value;
            const email = emailInput.value;
            const usernameField = usernameInput.value;
            const password = passwordInput.value;
            const role = roleInput.value;

            try {

                let response;

                if (editingId) {

                    // Editing: only include password if the admin actually
                    // typed a new one, so leaving it blank keeps the
                    // user's existing password untouched.
                    const payload = {
                        name,
                        email,
                        username: usernameField,
                        role
                    };

                    if (password.trim() !== "") {
                        payload.password = password;
                    }

                    response = await fetch(`${API_BASE}/users/${editingId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload)
                    });

                } else {

                    response = await fetch(`${API_BASE}/users/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            name,
                            email,
                            username: usernameField,
                            password,
                            role
                        })
                    });

                }

               if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    let firstError = "Please check the form.";

    if (errorData) {
        if (errorData.fieldErrors && Object.keys(errorData.fieldErrors).length > 0) {
            firstError = Object.values(errorData.fieldErrors)[0];
        } else if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            firstError = errorData.errors[0].defaultMessage || errorData.errors[0].message || firstError;
        } else if (errorData.message) {
            firstError = errorData.message;
        }
    }

    throw new Error(firstError + ` (status ${response.status})`);
}

                alert(editingId ? "User updated successfully." : "User created successfully.");
                form.reset();
                modal.style.display = "none";
                editingId = null;

                loadUsers();

            } catch (err) {
                console.error("Failed to save user:", err);
                alert("Could not save user: " + err.message);
            }

        });

    }


    function attachRowEvents() {

        document.querySelectorAll(".users-table .edit").forEach(button => {

            button.onclick = async function () {

                const row = this.closest("tr");
                const id = row.dataset.id;

                try {

                    const response = await fetch(`${API_BASE}/users/${id}`);
                    if (!response.ok) throw new Error("Not found");

                    const user = await response.json();
                    openModalForEdit(user);

                } catch (err) {
                    alert("Could not load user details for editing.");
                }

            };

        });

        document.querySelectorAll(".users-table .delete").forEach(button => {

            button.onclick = async function () {

                const row = this.closest("tr");
                const id = row.dataset.id;
                const name = row.querySelector("h4").innerText;

                if (!confirm("Delete " + name + " ?")) return;

                try {

                    const response = await fetch(`${API_BASE}/users/${id}`, {
                        method: "DELETE"
                    });

                    if (!response.ok) throw new Error("Server responded with " + response.status);

                    row.remove();
                    updateCount();

                } catch (err) {
                    alert("Could not delete user. Is the backend running?");
                }

            };

        });

    }


    if (searchInput) {

        searchInput.addEventListener("keyup", () => {

            const value = searchInput.value.toLowerCase();
            const rows = document.querySelectorAll(".users-table tbody tr");

            rows.forEach(row => {
                row.style.display =
                    row.innerText.toLowerCase().includes(value) ? "" : "none";
            });

        });

    }


    function updateCount() {
        const total = document.querySelectorAll(".users-table tbody tr").length;
        if (totalUsers) totalUsers.innerText = total;
    }

    console.log("VISIT LANKA Admin User Management Loaded");

});
