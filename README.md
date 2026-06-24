# 🍽️ Flavors & Fork — Full-Stack Restaurant Operations & Analytics Platform

A premium, production-grade MERN stack application engineered for modern restaurant administration. **Flavors & Fork** bridges the gap between an immersive, high-end consumer dining experience and a data-driven administrative back-office system.

Featuring a custom glassmorphism design language, real-time table reservation configurations, an operational kitchen display system, and comprehensive financial business analytics.

---

## 🚀 Core Features

### 💎 Elite Client Experience
* **Immersive Two-Column Hero:** Premium split-screen layout featuring an optimized transparent floating dish layout aligned with sharp typography.
* **Frosted-Glass Navigation:** A fully scroll-responsive, dynamic glassmorphic navbar that fluidly toggles background blurs (`backdrop-filter: blur(12px)`) as users explore the page.
* **Branded Typography:** Custom integration of the elegant **Pacifico** cursive headline script on the brand logo asset.
* **Balanced Menu Filter Panel:** Dual-aligned toolbar layout positioning a **Default Sort** control dropdown on the far-left and a responsive search bar on the far-right corner, framing an evenly spaced category capsule track (*All, Veg, Non-Veg, Starters, Main Course, Desserts, Beverages*).
* **Functional Footer Ecosystem:** An integrated newsletter subscription mechanism backed by state handlers and MongoDB database persistence.

### 📅 Advanced Table Reservation System
* **Visual Restaurant Floor Plan:** Real-time physical seating grids broken down into strategic zones:
  * *🪟 Window Views (Premium):* Rendered as sleek, compact square modules.
  * *🛋️ Main Dining Lounge:* Classic standard rectangular tables.
  * *🚪 Private Booths:* Expanded capsule spaces with custom margins preventing full-width layout stretching.
* **Dynamic State Engine:** Interactive table selection utilizing custom border glows and micro-scaling transitions (`transform: scale(1.02)`), with immediate color-coded lockouts for already **Booked** assets.
* **Glassmorphic Form Focus:** Booking information panels utilize a deep dark theme context featuring soft glowing gold focus indicators (`focus:ring-amber-500`).

### 📊 Enterprise Operations & Business Intelligence
* **Live Operational Queue:** A centralized administrator dashboard to supervise active table bookings and customer contact details in real-time. It uses a robust, centered vertical flex stack to protect text boundaries from button collisions.
* **Business Analytics Dashboard:** Financial and inventory summary layers parsing core restaurant metrics:
  * *Aggregate KPI Cards:* Dynamic metrics calculating Total Valuations, Category-Specific Average Dishes Prices, and Live Counts.
  * *Category Valuation Ledger:* A data-table breaking down active restaurant inventories with smooth row-hover visual feedback (`hover:bg-zinc-800/40`).
* **Live Kitchen Display System (KDS):** Direct pipeline rendering active cooking queues for rapid line completion and status fulfillment.

---

## 🛠️ Tech Stack & Architecture

### Frontend (Client-Tier)
* **React.js (v18+):** Component-driven Single Page Application architecture leveraging hooks (`useState`, `useEffect`) for state synchronizations.
* **Tailwind CSS:** Premium styling utilities matching a deep dark-mode aesthetic.
* **React Icons & Lucide-React:** Vector-based, uniform, system-independent layout iconographies.

### Backend (Server-Tier)
* **Node.js & Express.js:** Fast, modular RESTful API routing engine.
* **MongoDB & Mongoose:** NoSQL schema layout modeling handling database collections for `Menu` metrics, `Reservation` entries, and newsletter `Subscriber` records.
* **Gzip Compression Middleware:** Integrated `compression` bundles optimization parameters ensuring low data payloads and accelerated client layout loading over network threads.
* **Centralized Middleware Error Handler:** A unified error orchestration system intercepting unhandled rejections to safely serve normalized JSON interfaces across the client.

---

## 📂 Project Directory Structure

```text
flavors-and-fork/
├── backend/
│   ├── config/             # Database connection profiles (db.js)
│   ├── middleware/         # Centralized error handlers & compression filters
│   ├── models/             # Mongoose MongoDB Data Schemas (Subscriber, Reservation, Menu)
│   ├── routes/             # REST API Controller endpoints (newsletter, orders, tables)
│   └── server.js           # Server application bootstrap file
└── frontend/
    ├── public/             # Static graphics and image files
    └── src/
        ├── components/     # Reusable layout fragments (Navbar, Footer, Hero)
        ├── pages/          # Core views (Home, Menu, Reservation, Analytics, Kitchen)
        ├── index.css       # Global styling configurations & Pacifico imports
        └── App.jsx         # Client-side router mapping configuration
