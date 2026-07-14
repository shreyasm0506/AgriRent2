// public/js/booking.js
// Loads the equipment being booked (via ?item=<equipmentId>), shows a summary,
// lets the renter pick dates, calculates the total live, and submits the booking.

const wrap = document.getElementById("booking-wrap");

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}

function daysBetween(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const ms = end - start;
    if (isNaN(ms) || ms < 0) return 0;
    return Math.round(ms / (1000 * 60 * 60 * 24)) + 1; // inclusive
}

function renderMissingItem() {
    wrap.innerHTML = `
        <div class="booking-error">
            <h2>No equipment selected</h2>
            <p>Head back to the equipment page and choose something to rent.</p>
            <a href="/equipment"><button class="btn-primary">Browse equipment</button></a>
        </div>
    `;
}

function renderNotFound() {
    wrap.innerHTML = `
        <div class="booking-error">
            <h2>Equipment not found</h2>
            <p>That listing may have been removed. Try browsing available equipment instead.</p>
            <a href="/equipment"><button class="btn-primary">Browse equipment</button></a>
        </div>
    `;
}

function renderUnavailable(equipment) {
    wrap.innerHTML = `
        <div class="booking-error">
            <h2>${escapeHtml(equipment.name)} isn't available right now</h2>
            <p>${escapeHtml(equipment.availabilityLabel || "This item is currently unavailable.")}</p>
            <a href="/equipment"><button class="btn-primary">See other equipment</button></a>
        </div>
    `;
}

function renderBookingForm(equipment) {
    wrap.innerHTML = `
        <div class="booking-grid">
            <div class="booking-summary">
                <h3>${escapeHtml(equipment.name)}</h3>
                <div class="spec-row">${(equipment.specs || [])
                    .map((s) => `<span class="chip">${escapeHtml(s)}</span>`)
                    .join("")}</div>
                <p class="booking-location">📍 ${escapeHtml(equipment.location)}</p>
                <p class="booking-desc">${escapeHtml(equipment.description || "")}</p>
                <div class="gauge ${equipment.availabilityStatus}">${escapeHtml(equipment.availabilityLabel)}</div>
                <div class="price">₹${equipment.pricePerDay} <sub>/ day</sub></div>
            </div>

            <div class="login-container booking-form-card">
                <h2>Confirm your booking</h2>
                <p class="auth-sub">We'll confirm availability and contact you to finalize pickup/delivery.</p>
                <form id="booking-form">
                    <label for="startDate">Start date</label>
                    <input type="date" id="startDate" name="startDate" required>

                    <label for="endDate">End date</label>
                    <input type="date" id="endDate" name="endDate" required>

                    <label for="renterName">Full name</label>
                    <input type="text" id="renterName" name="renterName" placeholder="Your name" required>

                    <label for="renterPhone">Phone number</label>
                    <input type="tel" id="renterPhone" name="renterPhone" placeholder="10-digit mobile number" required>

                    <label for="renterEmail">Email (optional)</label>
                    <input type="email" id="renterEmail" name="renterEmail" placeholder="you@example.com">

                    <div class="price-breakdown" id="price-breakdown">
                        <span>Select dates to see the total</span>
                    </div>

                    <p class="booking-form-error" id="booking-form-error"></p>

                    <button type="submit" class="btn-primary loginbutton" id="booking-submit">Request Booking</button>
                </form>
            </div>
        </div>
    `;

    const startInput = document.getElementById("startDate");
    const endInput = document.getElementById("endDate");
    const breakdown = document.getElementById("price-breakdown");
    const errorEl = document.getElementById("booking-form-error");
    const form = document.getElementById("booking-form");
    const submitBtn = document.getElementById("booking-submit");

    const today = todayISO();
    startInput.min = today;
    endInput.min = today;

    function updatePriceBreakdown() {
        errorEl.textContent = "";
        if (!startInput.value || !endInput.value) {
            breakdown.innerHTML = `<span>Select dates to see the total</span>`;
            return;
        }
        const days = daysBetween(startInput.value, endInput.value);
        if (days <= 0) {
            breakdown.innerHTML = `<span class="price-error">End date must be on or after the start date.</span>`;
            return;
        }
        const total = days * equipment.pricePerDay;
        breakdown.innerHTML = `
            <span>₹${equipment.pricePerDay} × ${days} day${days > 1 ? "s" : ""}</span>
            <strong>₹${total}</strong>
        `;
    }

    startInput.addEventListener("change", () => {
        if (endInput.value && endInput.value < startInput.value) {
            endInput.value = startInput.value;
        }
        endInput.min = startInput.value || today;
        updatePriceBreakdown();
    });
    endInput.addEventListener("change", updatePriceBreakdown);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.textContent = "";

        const days = daysBetween(startInput.value, endInput.value);
        if (days <= 0) {
            errorEl.textContent = "Please choose a valid date range.";
            return;
        }

        const payload = {
            equipmentId: equipment._id,
            startDate: startInput.value,
            endDate: endInput.value,
            renterName: document.getElementById("renterName").value.trim(),
            renterPhone: document.getElementById("renterPhone").value.trim(),
            renterEmail: document.getElementById("renterEmail").value.trim(),
        };

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting…";

        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                errorEl.textContent = data.error || "Something went wrong. Please try again.";
                submitBtn.disabled = false;
                submitBtn.textContent = "Request Booking";
                return;
            }

            renderConfirmation(equipment, data);
        } catch (err) {
            console.error("Booking submission failed:", err);
            errorEl.textContent = "Couldn't reach the server. Please try again.";
            submitBtn.disabled = false;
            submitBtn.textContent = "Request Booking";
        }
    });
}

function renderConfirmation(equipment, booking) {
    const start = new Date(booking.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const end = new Date(booking.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    wrap.innerHTML = `
        <div class="feedback">
            <h2>Booking requested ✅</h2>
            <p>Your request for <strong>${escapeHtml(equipment.name)}</strong> has been sent to the owner.</p>
            <div class="booking-confirmation-details">
                <p><strong>Dates:</strong> ${start} – ${end} (${booking.days} day${booking.days > 1 ? "s" : ""})</p>
                <p><strong>Total:</strong> ₹${booking.totalPrice}</p>
                <p><strong>Status:</strong> ${booking.status}</p>
                <p><strong>Booking ID:</strong> ${booking._id}</p>
            </div>
            <a href="/equipment"><button class="btn-primary">Browse more equipment</button></a>
        </div>
    `;
}

async function init() {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("item");

    if (!itemId) {
        renderMissingItem();
        return;
    }

    try {
        const res = await fetch(`/api/equipment/${itemId}`);
        if (res.status === 404) {
            renderNotFound();
            return;
        }
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const equipment = await res.json();

        if (!equipment.available) {
            renderUnavailable(equipment);
            return;
        }

        renderBookingForm(equipment);
    } catch (err) {
        console.error("Failed to load equipment for booking:", err);
        wrap.innerHTML = `<p class="empty-state">Couldn't load this listing right now. Please try again shortly.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", init);
