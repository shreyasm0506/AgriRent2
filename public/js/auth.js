// public/js/auth.js
// Handles both the login form (#loginForm) and register form (#registerForm).
// Whichever is present on the page gets wired up; the other is simply absent.

const TOKEN_KEY = "agrirent_token";
const USER_KEY = "agrirent_user";

function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function redirectAfterAuth(user) {
    // Send farmers/owners to their equivalent dashboard once those exist;
    // for now everyone lands on the homepage.
    window.location.href = "/home";
}

function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
}

function hideError(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = "";
}

function setSubmitting(button, isSubmitting, idleText) {
    if (!button) return;
    button.disabled = isSubmitting;
    button.textContent = isSubmitting ? "Please wait…" : idleText;
}

function initLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const errorEl = document.getElementById("loginError");
    const submitBtn = document.getElementById("loginSubmit");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError(errorEl);

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showError(errorEl, "Please enter both email and password.");
            return;
        }

        setSubmitting(submitBtn, true, "Login");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                showError(errorEl, data.error || "Login failed. Please try again.");
                setSubmitting(submitBtn, false, "Login");
                return;
            }

            saveSession(data.token, data.user);
            redirectAfterAuth(data.user);
        } catch (err) {
            console.error("Login request failed:", err);
            showError(errorEl, "Couldn't reach the server. Please try again.");
            setSubmitting(submitBtn, false, "Login");
        }
    });
}

function initRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    const errorEl = document.getElementById("registerError");
    const submitBtn = document.getElementById("registerSubmit");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError(errorEl);

        const name = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        if (!name || !email || !password || !role) {
            showError(errorEl, "Please fill in all fields.");
            return;
        }
        if (password.length < 6) {
            showError(errorEl, "Password must be at least 6 characters.");
            return;
        }

        setSubmitting(submitBtn, true, "Register");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role }),
            });
            const data = await res.json();

            if (!res.ok) {
                showError(errorEl, data.error || "Registration failed. Please try again.");
                setSubmitting(submitBtn, false, "Register");
                return;
            }

            saveSession(data.token, data.user);
            redirectAfterAuth(data.user);
        } catch (err) {
            console.error("Register request failed:", err);
            showError(errorEl, "Couldn't reach the server. Please try again.");
            setSubmitting(submitBtn, false, "Register");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initLoginForm();
    initRegisterForm();
});
