# AgriRent 🌾

**AgriRent** is a full-stack agricultural equipment rental platform built to connect farmers with equipment owners across Karnataka, India. It enables owners to list farm machinery and equipment for rent, and farmers to browse, book, and manage rentals — all in one place.

This project is also being developed as an academic project (2025–26) at Dr. Ambedkar Institute of Technology (Dr. AIT), VTU, under the guidance of Ms. Sahana.

> Previously referenced as **KrishiRent**.

---

## 🚜 Problem Statement

Small and marginal farmers often can't afford to own expensive agricultural equipment (tractors, harvesters, tillers, etc.), while equipment owners often have machinery sitting idle between uses. AgriRent bridges this gap with a simple, accessible rental marketplace — improving equipment utilization for owners and access to modern machinery for farmers, without the upfront cost of ownership.

---

## ✨ Features

- **Equipment Listings** — Owners can list equipment with details, availability, and pricing
- **Booking Flow** — Farmers can browse, select dates, and book equipment
- **Authentication** — Secure user registration and login for both farmers and owners
- **Owner Dashboard** *(in progress)* — Manage listings, view booking requests, track rental history
- **Farmer Dashboard** *(in progress)* — Track active/past bookings, manage profile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM), hosted on MongoDB Atlas |
| Frontend | HTML/CSS/JavaScript (or update if using a framework) |
| Authentication | JWT / Session-based (update as applicable) |
| Version Control | Git & GitHub |

---

## 📂 Project Structure

```
agrirent/
├── models/          # Mongoose schemas (User, Equipment, Booking, etc.)
├── routes/          # Express route handlers / REST API endpoints
├── controllers/      # Business logic for routes
├── middleware/       # Auth & request middleware
├── public/            # Static frontend assets
├── views/              # Frontend pages (if using templating)
├── .env               # Environment variables (not committed)
├── server.js         # App entry point
└── package.json
```

*(Adjust this tree to match your actual folder layout.)*

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/shreyasm0506/agrirent.git
cd agrirent

# Install dependencies
npm install

# Set up environment variables
# Create a .env file in the root directory with:
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret

# Run the development server
npm start
```

The app should now be running at `http://localhost:5000`.

---

## 🗺️ Roadmap

- [x] Equipment listings
- [x] Booking flow
- [x] User authentication
- [ ] Farmer dashboard
- [ ] Owner dashboard
- [ ] Payment integration
- [ ] Reviews & ratings for equipment/owners
- [ ] Search & filter for equipment listings

---

## 🎓 Academic Context

This project serves as an academic project (2025–26) for the B.Tech Computer Science and Business Systems program at Dr. Ambedkar Institute of Technology, affiliated with Visvesvaraya Technological University (VTU), under the guidance of **Ms. Sahana**.

---

## 👤 Author

**Shreyas**
- GitHub: [@shreyasm0506](https://github.com/shreyasm0506)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
