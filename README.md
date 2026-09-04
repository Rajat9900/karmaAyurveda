# Karma Ayurveda Web Portal & Admin Panel

This repository houses the modern web platform for **Karma Ayurveda**, a prominent clinic group specializing in chronic and lifestyle diseases. It features a public-facing informative website and a secure, comprehensive administrative dashboard.

---

## Tech Stack & Architecture

- **Core Framework:** Next.js 16.2.10 (App Router, Server Actions) & React 19
- **Language:** TypeScript
- **Database:** MySQL/MariaDB (using `mysql2/promise` connection pooling)
- **Styling:** Tailwind CSS v4 & PostCSS
- **Rich Text Editor:** Quill JS
- **Authentication:** Edge-compatible cryptographically signed session cookies (HMAC SHA-256)

---

## Database Initialization & Setup

A programmatic schema and seeding engine is located in `src/lib/dbSetup.ts`. To initialize/seed the database:

1. Configure your database credentials in `.env.local`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_DATABASE=newkrm_db
   SESSION_SECRET=your_secure_random_string_here
   ```

2. Run the initialization script to automatically check/create all tables and seed data:
   ```bash
   npm run dev
   ```

---

## Features & Implementation Status

### Completed Milestones
* **Patient Intake (Lead Capture):** Interactive form collecting consultation bookings directly into the database.
* **Clinic Admin Dashboard:** Secure login & session verification guarding management tools for:
  * Health blogs (with category, tag support, and rich text editor).
  * Disease categories & specialized therapies.
  * Doctors lists (credentials and clinic mappings).
  * Multi-branch clinics (divided into Cancer, Knee, Panchakarma, and general clinics).
  * Site profiles, FAQs, media articles, and legal content pages.
* **Server Action Layer:** Optimized database operations via secure Next.js Server Actions.

### Remaining Roadmap
* **Data Migration:** Import legacy health articles and patient data from the old portal.
* **SEO & URL Redirection:** Hook up redirects to map legacy URLs to new paths and prevent broken indexing.
* **Frontend Data Integration:** Connect remaining static front-end components to pull content dynamically from the database.
* **Final Fixes:** Refine mobile responsive visuals and styling adjustments.

---

## Development Guide

First, install the dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public website, or head to [http://localhost:3000/admin](http://localhost:3000/admin) to access the management portal.

# karmaAyurveda
