// public/js/equipment.js
// Fetches equipment from the API and renders it into the catalog on /equipment.

const CATEGORY_ICONS = {
    tractor: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="18" cy="46" r="10"/><circle cx="47" cy="49" r="7"/><rect x="24" y="24" width="18" height="14" rx="2"/><path d="M32 24V14h9l4 10"/><path d="M18 36V30h6"/></svg>`,
    rotavator: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="14" y="26" width="34" height="6" rx="2"/><path d="M18 32v6M26 32v6M34 32v6M42 32v6"/><circle cx="16" cy="46" r="6"/><circle cx="46" cy="46" r="6"/><path d="M22 46h18"/></svg>`,
    harvestor: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="16" y="20" width="28" height="18" rx="2"/><path d="M44 24l8 4v6l-8 4"/><circle cx="22" cy="46" r="7"/><circle cx="40" cy="46" r="7"/></svg>`,
    sprayer: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="32" cy="24" r="9"/><path d="M14 30h36M18 30v4M26 30v4M38 30v4M46 30v4"/><circle cx="20" cy="46" r="6"/><circle cx="44" cy="46" r="6"/></svg>`,
    cultivator: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 28h36"/><circle cx="20" cy="28" r="4"/><circle cx="32" cy="28" r="4"/><circle cx="44" cy="28" r="4"/><circle cx="20" cy="48" r="6"/><circle cx="44" cy="48" r="6"/></svg>`,
    trailer: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="12" y="34" width="36" height="12" rx="2"/><path d="M12 34l6-8h10"/><circle cx="18" cy="50" r="5"/><circle cx="42" cy="50" r="5"/></svg>`,
};

const GAUGE_ICONS = {
    available: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 12l5 5L20 6"/></svg>`,
    limited: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 7v5l3 3"/><circle cx="12" cy="12" r="9"/></svg>`,
    booked: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>`,
};

const cardsContainer = document.querySelector(".cards");
const countEl = document.querySelector(".catalog-toolbar .count");
const sortSelect = document.querySelector(".catalog-toolbar select");
const categoryCheckboxes = document.querySelectorAll('.filter-group:nth-of-type(1) input[type="checkbox"]');
const priceRadios = document.querySelectorAll('.filter-group input[type="radio"]');
const availabilityCheckboxes = document.querySelectorAll('.filter-group:nth-of-type(3) input[type="checkbox"]');
const clearFiltersBtn = document.querySelector(".filters .btn-outline");
const navSearchInput = document.querySelector('.nav-search input[name="query"]');
const navSearchCategory = document.querySelector('.nav-search select[name="category"]');

const CATEGORY_ORDER = ["tractor", "harvestor", "rotavator", "cultivator", "sprayer", "trailer"];

function renderStars(rating) {
    const full = Math.round(rating || 0);
    return "★".repeat(full) + "☆".repeat(5 - full);
}

function renderCard(item) {
    const icon = CATEGORY_ICONS[item.category] || "";
    const gaugeIcon = GAUGE_ICONS[item.availabilityStatus] || GAUGE_ICONS.available;
    const specs = (item.specs || [])
        .map((s) => `<span class="chip">${escapeHtml(s)}</span>`)
        .join("");

    return `
        <div class="card" id="${item.category}" data-id="${item._id}">
            <div class="image-box">${icon}</div>
            <div class="gauge ${item.availabilityStatus}">${gaugeIcon} ${escapeHtml(item.availabilityLabel)}</div>
            <h3>${escapeHtml(item.name)}</h3>
            <div class="spec-row">${specs}</div>
            <div class="stars">${renderStars(item.rating)} <span>(${item.reviewCount || 0})</span></div>
            <div class="price">₹${item.pricePerDay} <sub>/ day</sub></div>
            <a href="/book?item=${item._id}"><button class="btn-primary">Rent Now</button></a>
        </div>
    `;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function getSelectedCategories() {
    const checked = Array.from(categoryCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb, i) => CATEGORY_ORDER[i]);
    return checked;
}

function getSelectedPriceRange() {
    const checkedRadio = Array.from(priceRadios).find((r) => r.checked);
    if (!checkedRadio) return {};
    const label = checkedRadio.parentElement.textContent.trim();
    if (label.includes("Under")) return { maxPrice: 500 };
    if (label.includes("500") && label.includes("1,000")) return { minPrice: 500, maxPrice: 1000 };
    if (label.includes("1,000") && label.includes("2,000")) return { minPrice: 1000, maxPrice: 2000 };
    return {};
}

function isAvailableOnlyFilter() {
    if (!availabilityCheckboxes.length) return false;
    return availabilityCheckboxes[0] && availabilityCheckboxes[0].checked;
}

function buildQueryParams() {
    const params = new URLSearchParams();
    const categories = getSelectedCategories();
    if (categories.length && categories.length < CATEGORY_ORDER.length) {
        params.set("category", categories.join(","));
    }
    const { minPrice, maxPrice } = getSelectedPriceRange();
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (isAvailableOnlyFilter()) params.set("availability", "available");

    if (navSearchInput && navSearchInput.value.trim()) {
        params.set("q", navSearchInput.value.trim());
    }

    if (sortSelect) {
        const sortMap = {
            "Price: Low to High": "price_asc",
            "Price: High to Low": "price_desc",
            "Highest Rated": "rating",
        };
        const sortValue = sortMap[sortSelect.value];
        if (sortValue) params.set("sort", sortValue);
    }

    return params;
}

async function loadEquipment() {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = `<p class="loading">Loading equipment…</p>`;

    try {
        const params = buildQueryParams();
        const res = await fetch(`/api/equipment?${params.toString()}`);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();

        if (!data.equipment || data.equipment.length === 0) {
            cardsContainer.innerHTML = `<p class="empty-state">No equipment matches your filters. Try adjusting them.</p>`;
        } else {
            cardsContainer.innerHTML = data.equipment.map(renderCard).join("");
        }

        if (countEl) {
            countEl.textContent = `Showing ${data.count} of ${data.count} results`;
        }
    } catch (err) {
        console.error("Failed to load equipment:", err);
        cardsContainer.innerHTML = `<p class="empty-state">Couldn't load equipment right now. Please try again shortly.</p>`;
    }
}

function applyCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category && navSearchCategory) {
        navSearchCategory.value = category;
    }
    const q = params.get("q");
    if (q && navSearchInput) {
        navSearchInput.value = q;
    }
}

function bindEvents() {
    categoryCheckboxes.forEach((cb) => cb.addEventListener("change", loadEquipment));
    priceRadios.forEach((r) => r.addEventListener("change", loadEquipment));
    availabilityCheckboxes.forEach((cb) => cb.addEventListener("change", loadEquipment));
    if (sortSelect) sortSelect.addEventListener("change", loadEquipment);

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", (e) => {
            e.preventDefault();
            categoryCheckboxes.forEach((cb) => (cb.checked = true));
            priceRadios.forEach((r) => (r.checked = r.parentElement.textContent.includes("Any price")));
            availabilityCheckboxes.forEach((cb) => (cb.checked = false));
            if (navSearchInput) navSearchInput.value = "";
            if (sortSelect) sortSelect.selectedIndex = 0;
            loadEquipment();
        });
    }

    // The nav search form currently posts to /search which doesn't exist as a
    // page route. Intercept it so search stays on the equipment listing page.
    const navSearchForm = document.querySelector(".nav-search");
    if (navSearchForm) {
        navSearchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            loadEquipment();
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    applyCategoryFromUrl();
    bindEvents();
    loadEquipment();

    // Support #tractor style anchors from other pages by scrolling once cards load.
    if (window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
    }
});
