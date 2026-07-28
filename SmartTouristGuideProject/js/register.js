// ===============================
// VISIT LANKA REGISTER
// Spring Boot Ready
// ===============================

const API_BASE = "http://localhost:8080/api";

const registerForm = document.getElementById("registerForm");
const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

// NOTE: the "username" field in the form isn't stored by the backend —
// the UserAccount model only has name, email, and password. The field
// stays in the form for now but isn't sent to the server.

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = fullname.value.trim();
    const userEmail = email.value.trim();
    const pass = password.value.trim();
    const confirmPass = confirmPassword.value.trim();

    // Validation

    if (name === "" || userEmail === "" || pass === "" || confirmPass === "") {

        alert("Please fill in all fields.");

        return;

    }

    if (pass !== confirmPass) {

        alert("Passwords do not match.");

        return;

    }

    if (pass.length < 6) {

        alert("Password must be at least 6 characters.");

        return;

    }

    try {

        const response = await fetch(`${API_BASE}/users/register`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },
body: JSON.stringify({

    name: name,
    email: userEmail,
    username: document.getElementById("username").value.trim(),
    password: pass

})

        });

        if (response.ok) {

            const data = await response.json();

            alert("Account created! Welcome " + data.name + ".");

            window.location.href = "login.html";

        } else {

            // Spring's @Valid validation errors come back as JSON with
            // field-specific messages; show the first one if present.
            const errorData = await response.json().catch(() => null);

            const message =
                errorData && typeof errorData === "object"
                    ? Object.values(errorData)[0]
                    : "Registration failed. Please check your details.";

            alert(message);

        }

    } catch (err) {

        console.error("Registration error:", err);

        alert("Could not connect to the server. Make sure the backend is running on localhost:8080.");

    }

});
