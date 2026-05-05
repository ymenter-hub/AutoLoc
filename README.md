# 🚗 Auto-Loc — Vehicle Rental Platform

> **Projet de Fin de Module** — Architecture Cloud & Vibe Programming
> Stack: React 18 · Vite · Supabase · Tailwind CSS · Framer Motion · Vercel

**Live App:** `https://myautoloc.vercel.app`
**GitHub:** https://github.com/ymenter-hub/myautoloc.git

---

## 📋 What is Auto-Loc?

Auto-Loc is a full-stack vehicle rental SaaS that connects **agency owners** with **clients**. Owners list their fleet and manage bookings; clients browse available cars, reserve them with date selection, and upload their driver's license for verification — all in a polished dark-themed UI with real-time feedback.

---

## 🗂 Theme Mapping (Academic Requirements)

| Layer | Entity | Description |
|---|---|---|
| **Table A** — Users | `profiles` (via Supabase Auth) | Clients and Agency Owners. Role stored as `client` or `owner`. Agency owners also store `agency_name`. |
| **Table B** — Resources | `vehicles` + `vehicle_images` | Cars listed by owners: brand, model, year, plate number, daily price, fuel type, availability status, and a multi-image gallery. |
| **Table C** — Interactions | `reservations` | Links a client to a vehicle with start/end dates, computed total price, and a status state machine (`pending` → `confirmed` / `rejected` / `cancelled`). |
| **Table D** — Messaging | `notifications` | In-app messages sent by owners to clients (targeted or broadcast). Supports `info`, `deal`, and `alert` types with real-time delivery via Supabase Realtime. |
| **Storage** — Files | `licenses` bucket | Driver's license photos uploaded privately at reservation time, with per-user path isolation. |

**Key business rule:** When an owner **confirms** one reservation, a PostgreSQL trigger automatically marks the vehicle as unavailable and **rejects all other pending reservations** for that same vehicle — preventing any double-booking at the database level.

---

## 🧪 Test Credentials

| Role | Email | Password |
|---|---|---|
| Client | `yahyamenter404@gmail.com` | `yahyaYAHYA2006` |
| Agency Owner | `cleanultra50@gmail.com` | `cleanCLEAN` |


---

## 📁 Project Structure

```
auto-loc/
├── src/
│   ├── App.jsx                        # Router + role-based route guards
│   ├── main.jsx                       # React entry point
│   ├── index.css                      # Global styles, CSS variables, Tailwind
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx             # Top nav with avatar, profile dropdown
│   │   │   ├── ClientLayout.jsx       # Layout wrapper for client pages
│   │   │   └── OwnerLayout.jsx        # Layout wrapper for owner pages
│   │   ├── notifications/
│   │   │   ├── NotificationForm.jsx   # Owner: compose & send notifications
│   │   │   ├── NotificationInbox.jsx  # Client: read/dismiss notifications
│   │   │   └── NotificationLog.jsx    # Owner: view sent notification history
│   │   └── ui/
│   │       ├── Button.jsx             # Variants: primary, ghost, danger, success
│   │       ├── Input.jsx              # Floating-label input with error/hint states
│   │       ├── Modal.jsx              # Animated modal (sm/md/lg sizes)
│   │       ├── Badge.jsx              # Status badge (pending/confirmed/rejected)
│   │       ├── Select.jsx             # Styled select dropdown
│   │       ├── AvatarCropper.jsx      # Crop + zoom avatar before upload
│   │       ├── VehicleImageGallery.jsx # Multi-image upload + preview management
│   │       └── VehicleImageViewer.jsx  # Lightbox viewer for vehicle photos
│   ├── contexts/
│   │   ├── AuthContext.jsx            # Session, profile, role, avatar management
│   │   ├── NotificationContext.jsx    # Real-time notification state + badge count
│   │   └── ToastContext.jsx           # Global toast notification queue
│   ├── lib/
│   │   └── supabase.js                # Supabase client (with mock fallback if no .env)
│   └── pages/
│       ├── LandingPage.jsx            # Public marketing page
│       ├── ProfilePage.jsx            # Shared profile settings (name, phone, agency, avatar)
│       ├── auth/
│       │   ├── LoginPage.jsx          # Email + password sign-in
│       │   ├── RegisterPage.jsx       # 2-step registration with role selection
│       │   └── VerifyEmailPage.jsx    # Post-signup verification prompt
│       ├── client/
│       │   ├── ClientDashboard.jsx    # Overview: stats, recent reservations
│       │   ├── VehiclesPage.jsx       # Browse fleet, filter, reserve with license upload
│       │   ├── MyReservationsPage.jsx # Track booking statuses, cancel pending
│       │   └── NotificationsPage.jsx  # In-app notification inbox
│       └── owner/
│           ├── OwnerDashboard.jsx         # Fleet stats, recent requests table
│           ├── ManageVehiclesPage.jsx     # Full CRUD: add/edit/delete vehicles + gallery
│           ├── ManageReservationsPage.jsx # Confirm/reject with license viewer
│           └── NotificationsPage.jsx      # Send notifications to clients
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql             # Tables, RLS policies, triggers
│       └── 002_notifications.sql     # Notifications table + Realtime setup
├── scratch/
│   └── chatbot_setup.sql             # Optional AI chatbot integration scaffold
├── public/
│   └── car.mp4                       # Background video for register page
├── vercel.json                        # SPA rewrite: all paths → index.html
├── tailwind.config.js                 # Custom design tokens (colors, fonts)
├── vite.config.js                     # Vite build config
└── .env                               # Local secrets (not committed)
```

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────┐
│           React App (Vite)               │
│  Tailwind CSS · Framer Motion · Lucide   │
└────────────────┬─────────────────────────┘
                 │ @supabase/supabase-js (REST + Realtime)
┌────────────────▼─────────────────────────┐
│              Supabase Platform           │
│  ┌─────────────┐  ┌────────────────────┐ │
│  │ PostgreSQL  │  │  Auth (JWT/email)  │ │
│  │  + RLS      │  └────────────────────┘ │
│  │  + Triggers │  ┌────────────────────┐ │
│  └─────────────┘  │  Storage (S3-like) │ │
│                   │  avatars / licenses │ │
│  ┌─────────────┐  └────────────────────┘ │
│  │  Realtime   │                         │
│  │  (WS/pgcdc) │                         │
│  └─────────────┘                         │
└──────────────────────────────────────────┘
                 │
       Deployed via Vercel CDN
```

**No custom backend server.** Supabase acts as the entire backend: REST API, auth, file storage, real-time websocket subscriptions, and database-level business logic via PostgreSQL triggers and Row Level Security.

---

## 🔐 Role-Based Access

| Role | Can Do | Cannot Do |
|---|---|---|
| **client** | Browse vehicles, make reservations, upload license, receive notifications, manage profile | Manage vehicles, see other clients' data |
| **owner** | List/edit/delete vehicles, approve/reject reservations, view client licenses, send notifications, set agency name | Reserve vehicles as client, see other owners' fleet |
| **anonymous** | View landing page, login, register | Any authenticated action |

Route guards in `App.jsx` enforce role checks before rendering any protected page.

---

## 🔄 Application Routes

### Public
| Path | Page |
|---|---|
| `/` | Landing Page |
| `/login` | Login |
| `/register` | Register (2-step with role selection) |
| `/verify-email` | Email verification prompt |

### Client (requires `role === 'client'`)
| Path | Page |
|---|---|
| `/client/dashboard` | Overview & stats |
| `/client/vehicles` | Browse fleet & reserve |
| `/client/reservations` | My bookings |
| `/client/notifications` | Notification inbox |
| `/client/profile` | Profile settings |

### Owner (requires `role === 'owner'`)
| Path | Page |
|---|---|
| `/owner/dashboard` | Agency overview |
| `/owner/vehicles` | Manage fleet (CRUD) |
| `/owner/reservations` | Manage reservations |
| `/owner/notifications` | Send notifications |
| `/owner/profile` | Profile + agency name settings |

**Smart redirect:** `/dashboard` reads `profile.role` and redirects to the appropriate dashboard automatically.

---

## 📊 Academic Architecture Questions (Mission 4) (French Version)

### Q1 — Pourquoi Vercel + Supabase est financièrement plus logique qu'un serveur classique ?

Un projet démarrant from scratch doit éviter les coûts fixes lourds. Un serveur classique représente du **CAPEX** (Capital Expenditure) : achat de machines, licences, infrastructure réseau, climatisation — des dépenses immobilisées avant même d'avoir un seul utilisateur.

Vercel et Supabase relèvent de l'**OPEX** (Operational Expenditure) : on paie uniquement ce qu'on consomme, mensuellement. Supabase offre une base PostgreSQL hébergée, une API auto-générée, le stockage de fichiers, l'authentification **et** les websockets Realtime dans un seul plan gratuit (500MB DB, 1GB Storage, 50,000 MAU). Vercel déploie automatiquement depuis GitHub avec un CDN mondial inclus.

**Résultat :** zéro investissement initial, mise en production en minutes, structure de coûts proportionnelle aux revenus.

---

### Q2 — Comment Vercel gère-t-il la scalabilité par rapport à un Data Center physique ?

Un data center physique est dimensionné pour le **pic** prévisible. La capacité inutilisée est gaspillée, et la montée en charge demande des semaines de procurement.

Vercel déploie le frontend en **Edge Network** mondial — fichiers statiques servis depuis le PoP le plus proche du client, latence quasi-nulle. Les fonctions serverless s'instancient à la demande, sans serveur en veille. Supabase gère la scalabilité de la couche données de la même manière, avec connection pooling et réplication intégrés.

---

### Q3 — Donnée Structurée vs Donnée Non-structurée dans Auto-Loc

**Données structurées** : tables PostgreSQL (`profiles`, `vehicles`, `reservations`, `notifications`) — données typées, indexées, liées par clés étrangères, interrogeables en SQL.

**Données non-structurées** : photos de permis (`licenses/`) et avatars (`avatars/`) dans Supabase Storage — fichiers binaires sans schéma, référencés uniquement par leur chemin d'objet.

---

## 📊 Academic Architecture Questions (Mission 4) (English Version)


### Q1 — Why is Vercel + Supabase financially more logical than a traditional server?
A project starting from scratch must avoid heavy fixed costs. A traditional server represents CAPEX (Capital Expenditure): purchasing machines, licenses, network infrastructure, cooling systems — expenses locked in before a single user exists.
Vercel and Supabase fall under OPEX (Operational Expenditure): you only pay for what you consume, monthly. Supabase provides a hosted PostgreSQL database, an auto-generated API, file storage, authentication, and Realtime WebSockets all within a single free tier (500MB DB, 1GB Storage, 50,000 MAU). Vercel deploys automatically from GitHub with a global CDN included.
Result: zero upfront investment, production-ready in minutes, cost structure that scales proportionally with revenue.

### Q2 — How does Vercel handle scalability compared to a physical Data Center?
A physical data center is sized for the predictable peak — you buy server racks, plan cooling and redundant power for 10,000 simultaneous users even if you only have 50 on a typical day. Unused capacity is wasted, and scaling up takes weeks of procurement.
Vercel deploys the frontend across a global Edge Network — static files served from the Point of Presence (PoP) closest to the user, near-zero latency. Serverless functions are instantiated on demand, with no server idling in the background. Supabase handles data layer scalability the same way, with built-in connection pooling and replication.

### Q3 — Structured Data vs Unstructured Data in Auto-Loc
Structured data: PostgreSQL tables (profiles, vehicles, reservations, notifications) — typed, indexed, linked by foreign keys, and queryable via SQL.
Unstructured data: driver's license photos (licenses/) and avatars (avatars/) in Supabase Storage — binary files with no schema, referenced only by their object path.

