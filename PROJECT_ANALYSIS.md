# 🚗 Auto-Loc — Complete Project Analysis

**Last Updated:** May 5, 2026
**Analysis Scope:** Full-stack architecture, database design, security model, component hierarchy

---

## 📌 Project Overview

**Auto-Loc** is a vehicle rental SaaS platform built on a cloud-native, serverless stack. It allows agency owners to list their fleet, receive and manage booking requests, and communicate with clients — while clients can browse available vehicles, reserve them with integrated date-based pricing, upload their driver's license, and track their bookings in real time.

| Property | Value |
|---|---|
| **Project Type** | Full-stack web application (Frontend + BaaS) |
| **Status** | Production-ready, deployed on Vercel |
| **Live URL** | `https://myautoloc.vercel.app` |
| **Auth Model** | Email/password with email verification |
| **Data Layer** | Supabase (PostgreSQL + RLS + Triggers + Realtime) |
| **File Storage** | Supabase Storage (private buckets) |
| **Realtime** | Supabase Realtime (WebSocket/pgcdc) for notifications |

---

## 🏗 Tech Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| React | 18.2.0 | UI framework (Hooks-based, no class components) |
| Vite | 8.0.10 | Build tool + dev server with HMR |
| React Router DOM | 6.22.0 | Client-side routing with nested layouts |
| Tailwind CSS | 3.4.17 | Utility-first styling with custom design tokens |
| Framer Motion | 12.38.0 | Page transitions, card animations, micro-interactions |
| Lucide React | 0.344.0 | SVG icon library (tree-shakeable) |
| date-fns | 3.3.1 | Date arithmetic (rental duration calculation) |
| react-easy-crop | 5.5.7 | In-browser avatar image cropping with zoom |

### Backend / Infrastructure
| Technology | Role |
|---|---|
| Supabase (PostgreSQL) | Primary database with 5 tables |
| Supabase Auth | Email/password authentication + JWT session management |
| Supabase Storage | Private file buckets for licenses and avatars |
| Supabase Realtime | WebSocket subscriptions for live notification delivery |
| PostgreSQL Triggers | Business logic enforcement at database level |
| Row Level Security (RLS) | Per-row authorization policies for all tables |
| Vercel | Static hosting + global CDN edge network |

### Optional / Scaffolded
| Technology | Role |
|---|---|
| @google/generative-ai | Gemini AI integration scaffold (chatbot) |
| @n8n/chat | n8n workflow chat widget scaffold |

---

## 🗂 Project Structure

```
auto-loc/
├── src/
│   ├── App.jsx                        # Router + role-based route guards + page transitions
│   ├── main.jsx                       # ReactDOM.createRoot entry point
│   ├── index.css                      # CSS custom properties, Tailwind directives, globals
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx             # Top navigation: avatar dropdown, notification bell, sign out
│   │   │   ├── ClientLayout.jsx       # Client dashboard shell (Navbar + Outlet)
│   │   │   └── OwnerLayout.jsx        # Owner dashboard shell (Navbar + Outlet)
│   │   │
│   │   ├── notifications/
│   │   │   ├── NotificationForm.jsx   # Owner: compose messages, target all clients or specific user
│   │   │   ├── NotificationInbox.jsx  # Client: read/mark-read/delete notifications
│   │   │   └── NotificationLog.jsx    # Owner: history of sent notifications
│   │   │
│   │   └── ui/
│   │       ├── Button.jsx             # variants: primary | ghost | danger | success; sizes: sm | md | lg
│   │       ├── Input.jsx              # Floating-label input; handles date/number always-up labels
│   │       ├── Modal.jsx              # AnimatePresence modal; sizes: sm | md | lg
│   │       ├── Badge.jsx              # Status pill: pending (yellow) | confirmed (green) | rejected (red)
│   │       ├── Select.jsx             # Styled <select> matching Input visual language
│   │       ├── AvatarCropper.jsx      # Crop + zoom modal before uploading profile picture
│   │       ├── VehicleImageGallery.jsx # Drag-to-reorder multi-image upload UI
│   │       └── VehicleImageViewer.jsx  # Keyboard-navigable lightbox for vehicle photos
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx            # Session, profile (with agency_name), role flags, avatar upload
│   │   ├── NotificationContext.jsx    # Real-time subscription, unread count, mark-read
│   │   └── ToastContext.jsx           # Global toast queue (success | error | info)
│   │
│   ├── lib/
│   │   └── supabase.js                # Supabase client init; mock client fallback when .env is missing
│   │
│   └── pages/
│       ├── LandingPage.jsx            # Public hero + features + CTA
│       ├── ProfilePage.jsx            # Shared settings: name, phone, agency name (owner-only), avatar
│       │
│       ├── auth/
│       │   ├── LoginPage.jsx          # Sign in form
│       │   ├── RegisterPage.jsx       # 2-step animated form; role selector; agency name for owners
│       │   └── VerifyEmailPage.jsx    # Post-signup prompt to check inbox
│       │
│       ├── client/
│       │   ├── ClientDashboard.jsx    # Animated stat counters, recent reservations
│       │   ├── VehiclesPage.jsx       # Vehicle grid with search/filter, reservation modal, license upload
│       │   ├── MyReservationsPage.jsx # List own bookings with status badges, cancel action
│       │   └── NotificationsPage.jsx  # Notification inbox wrapper
│       │
│       └── owner/
│           ├── OwnerDashboard.jsx         # Animated counters, agency badge, recent requests table
│           ├── ManageVehiclesPage.jsx     # CRUD with multi-image gallery, search filter
│           ├── ManageReservationsPage.jsx # Confirm/reject with license viewer, loading states
│           └── NotificationsPage.jsx      # Compose + send + log wrapper
│
├── supabase/
│   └── migrations/
│       ├── 001_schema.sql             # Core schema: 4 tables, 4 triggers, full RLS, storage policies
│       └── 002_notifications.sql     # Notifications table, RLS, Realtime publication
│
├── scratch/
│   └── chatbot_setup.sql             # AI chatbot integration scaffold
│
├── public/
│   └── car.mp4                       # Background video for register page
│
├── vercel.json                        # {"rewrites": [{"source":"/(.*)", "destination":"/index.html"}]}
├── tailwind.config.js                 # Custom colors, fonts (bg-bg-base, text-accent, etc.)
├── vite.config.js                     # @vitejs/plugin-react
└── package.json                       # Dependencies + npm scripts
```

---

## 🗄 Database Design

### Table 1: `profiles`
Extends Supabase `auth.users` with application-level profile data. Created automatically via trigger on every signup.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | UUID | PK, FK → `auth.users(id)` ON DELETE CASCADE | Ties directly to Supabase auth identity |
| `full_name` | TEXT | NOT NULL | Display name |
| `phone` | TEXT | — | Contact number |
| `avatar_url` | TEXT | — | Signed URL (refreshed on login) |
| `avatar_path` | TEXT | — | Storage path in `avatars/` bucket |
| `agency_name` | TEXT | — | Only meaningful for `owner` role |
| `role` | TEXT | CHECK IN ('client','owner'), DEFAULT 'client' | Controls dashboard routing + feature access |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |

---

### Table 2: `vehicles`
Represents cars owned by agency owners.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT gen_random_uuid() | Unique vehicle identifier |
| `owner_id` | UUID | FK → `profiles(id)` ON DELETE CASCADE | Which agency owns this car |
| `brand` | TEXT | NOT NULL | Manufacturer (Renault, BMW, etc.) |
| `model` | TEXT | NOT NULL | Model name |
| `year` | INT | NOT NULL | Manufacturing year |
| `color` | TEXT | NOT NULL | Paint color |
| `plate_number` | TEXT | NOT NULL, UNIQUE | Algerian plate (prevents duplicates) |
| `daily_price` | NUMERIC(10,2) | NOT NULL | Price per day in DZD |
| `fuel_type` | TEXT | CHECK IN ('petrol','diesel','electric','hybrid') | Fuel category |
| `transmission` | TEXT | CHECK IN ('manual','automatic') | Gearbox type |
| `seats` | INT | NOT NULL, DEFAULT 5 | Passenger capacity |
| `image_url` | TEXT | — | Primary cover image URL |
| `description` | TEXT | — | Free-text notes / features |
| `is_available` | BOOLEAN | DEFAULT TRUE | Updated by trigger on reservation confirmation |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Listing date |

---

### Table 2b: `vehicle_images`
Supports multi-image galleries per vehicle.

| Column | Type | Purpose |
|---|---|---|
| `id` | UUID | PK |
| `vehicle_id` | UUID | FK → `vehicles(id)` ON DELETE CASCADE |
| `url` | TEXT | Public image URL (Supabase Storage or external CDN) |
| `created_at` | TIMESTAMPTZ | Upload timestamp |

---

### Table 3: `reservations`
The core transaction table — links clients to vehicles with full booking lifecycle state.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | UUID | PK | Unique booking ID |
| `client_id` | UUID | FK → `profiles(id)` | Who is renting |
| `vehicle_id` | UUID | FK → `vehicles(id)` | Which car |
| `start_date` | DATE | NOT NULL | Rental start |
| `end_date` | DATE | NOT NULL | Rental end |
| `total_price` | NUMERIC(10,2) | NOT NULL | Pre-computed: days × daily_price |
| `status` | TEXT | CHECK IN ('pending','confirmed','rejected','cancelled'), DEFAULT 'pending' | Booking state machine |
| `license_url` | TEXT | — | Supabase Storage path to uploaded driver license |
| `notes` | TEXT | — | Client notes (address, special requests) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Booking creation time |
| `updated_at` | TIMESTAMPTZ | Auto-updated by trigger | Last status change time |

**Date constraint:** `CHECK (end_date > start_date)` enforced at DB level.

---

### Table 4: `notifications`
In-app messaging from owners to clients, delivered in real time.

| Column | Type | Constraints | Purpose |
|---|---|---|---|
| `id` | UUID | PK | Unique message ID |
| `sender_id` | UUID | FK → `profiles(id)` | Owner who sent it |
| `receiver_id` | UUID | FK → `profiles(id)`, nullable | Target client (NULL = not used; inserts one row per recipient) |
| `message` | TEXT | NOT NULL | Notification body |
| `type` | TEXT | CHECK IN ('info','deal','alert') | Visual badge type |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read state (client updates this) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Send time |

**Realtime:** `ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications` — clients receive new rows via WebSocket without polling.

---

## ⚙️ Business Logic — PostgreSQL Triggers

### Trigger 1: `handle_reservation_confirmation()`
Fires `AFTER UPDATE OF status ON reservations` for each row.

**When status changes TO `'confirmed'`:**
1. Sets `vehicles.is_available = FALSE` for that vehicle
2. Updates all other `pending` reservations for the same vehicle to `rejected`

**When status changes TO `'rejected'` or `'cancelled'` from `'confirmed'`:**
1. Sets `vehicles.is_available = TRUE` — re-opens the vehicle for new bookings

**Why at DB level?** Business rules enforced in PostgreSQL are immune to frontend bugs, API misuse, or concurrent race conditions. Even if two owners somehow clicked "Confirm" simultaneously, the trigger guarantees exactly one wins.

---

### Trigger 2: `handle_new_user()`
Fires `AFTER INSERT ON auth.users`.

Automatically creates a `profiles` row from `raw_user_meta_data` passed during `supabase.auth.signUp()`:

```sql
INSERT INTO public.profiles (id, full_name, role, agency_name)
VALUES (
  NEW.id,
  COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
  NEW.raw_user_meta_data->>'agency_name'
);
```

This means the profile is created atomically with the auth account — no separate API call needed after signup.

---

### Trigger 3: `update_updated_at_column()`
Fires `BEFORE UPDATE ON reservations`.
Automatically sets `updated_at = NOW()` on every status change — no application code needed.

---

## 🔐 Security Architecture

### Authentication Flow
```
Register → Supabase Auth (email + password)
        → Verification email sent
        → User clicks link → email_confirmed = true
        → Login → JWT issued (access_token + refresh_token)
        → AuthContext fetches profile from profiles table
        → Role-based routing in App.jsx
```

### Row Level Security (RLS) — Complete Policy Map

**`profiles` table:**
- `SELECT`: only own row (`auth.uid() = id`)
- `UPDATE`: only own row (`auth.uid() = id`)
- No `INSERT` policy needed — `handle_new_user` trigger runs as `SECURITY DEFINER`

**`vehicles` table:**
- `SELECT`: all authenticated users (clients need to browse)
- `INSERT`: authenticated users where `owner_id = auth.uid()` AND `role = 'owner'`
- `UPDATE`: same — owner of the vehicle only
- `DELETE`: same — owner of the vehicle only

**`reservations` table:**
- `SELECT`: client sees their own; owner sees reservations on their vehicles (via JOIN)
- `INSERT`: authenticated user where `client_id = auth.uid()` AND `role = 'client'`
- `UPDATE`: client can cancel own pending reservation; owner can confirm/reject their vehicle's reservations

**`notifications` table:**
- `SELECT`: sender (owner) sees sent; receiver (client) sees received
- `INSERT`: `sender_id = auth.uid()` only
- `UPDATE`: receiver can mark as read
- `DELETE`: receiver can dismiss

**Storage `licenses` bucket:**
- `INSERT`: path must start with `auth.uid()` — e.g. `{user_id}/{filename}`
- `SELECT`: uploader always; owner can read if their vehicle's reservation references that file

**Storage `avatars` bucket:**
- Per-user path isolation using same `auth.uid()` prefix pattern

---

## 🔄 Application Routes

### Public
| Path | Component | Notes |
|---|---|---|
| `/` | LandingPage | Hero, features, CTA |
| `/login` | LoginPage | Email + password |
| `/register` | RegisterPage | 2-step: name → email/password; role toggle; agency name for owners |
| `/verify-email` | VerifyEmailPage | Post-signup prompt |

### Client Routes (`role === 'client'` required)
| Path | Component | Key Features |
|---|---|---|
| `/client/dashboard` | ClientDashboard | Animated stats, recent activity |
| `/client/vehicles` | VehiclesPage | Search, gallery viewer, reservation modal, license upload |
| `/client/reservations` | MyReservationsPage | Status tracking, cancel pending bookings |
| `/client/notifications` | NotificationsPage | Real-time inbox, mark as read, type badges |
| `/client/profile` | ProfilePage | Name, phone, avatar with crop |

### Owner Routes (`role === 'owner'` required)
| Path | Component | Key Features |
|---|---|---|
| `/owner/dashboard` | OwnerDashboard | Agency name badge, animated counters, request table |
| `/owner/vehicles` | ManageVehiclesPage | Add/edit/delete vehicles, multi-image gallery management |
| `/owner/reservations` | ManageReservationsPage | Confirm/reject, view client license, loading states |
| `/owner/notifications` | NotificationsPage | Send to all clients or specific user, view sent log |
| `/owner/profile` | ProfilePage | Name, phone, agency name, avatar with crop |

### Smart Redirects
- `/dashboard` → reads `profile.role` → redirects to appropriate dashboard
- `*` (any unknown path) → redirects to `/`

---

## 🎨 Component Hierarchy

```
App (BrowserRouter)
└── AuthProvider
    └── NotificationProvider
        └── ToastProvider
            └── AppRoutes (AnimatePresence)
                ├── LandingPage                 (public)
                ├── LoginPage                   (public)
                ├── RegisterPage                (public)
                ├── VerifyEmailPage             (public)
                │
                ├── ClientLayout               (role: client)
                │   └── Navbar
                │       └── Outlet
                │           ├── ClientDashboard
                │           ├── VehiclesPage
                │           │   ├── VehicleImageViewer
                │           │   └── Modal (reservation form)
                │           ├── MyReservationsPage
                │           ├── NotificationsPage
                │           │   └── NotificationInbox
                │           └── ProfilePage
                │               └── AvatarCropper
                │
                └── OwnerLayout                (role: owner)
                    └── Navbar
                        └── Outlet
                            ├── OwnerDashboard
                            ├── ManageVehiclesPage
                            │   ├── VehicleImageGallery
                            │   ├── VehicleImageViewer
                            │   └── Modal (add/edit form)
                            ├── ManageReservationsPage
                            ├── NotificationsPage
                            │   ├── NotificationForm
                            │   └── NotificationLog
                            └── ProfilePage
                                └── AvatarCropper
```

---

## 💾 Data Flow Architecture

```
┌──────────────────────────────────────────────────┐
│                  React App                       │
│  AuthContext → session + profile + role flags    │
│  NotificationContext → unread count + WS sub     │
│  ToastContext → global toast queue               │
└───────────────┬──────────────────────────────────┘
                │
       @supabase/supabase-js
       REST (HTTP) + Realtime (WebSocket)
                │
┌───────────────▼──────────────────────────────────┐
│              Supabase Platform                   │
│                                                  │
│  ┌───────────────┐   ┌──────────────────────┐   │
│  │  PostgreSQL   │   │  Auth (GoTrue)        │   │
│  │  + RLS        │   │  JWT access tokens    │   │
│  │  + Triggers   │   │  Refresh token mgmt   │   │
│  └───────────────┘   └──────────────────────┘   │
│                                                  │
│  ┌───────────────┐   ┌──────────────────────┐   │
│  │  Storage      │   │  Realtime (pgcdc)     │   │
│  │  licenses/    │   │  notifications table  │   │
│  │  avatars/     │   │  WebSocket broadcast  │   │
│  └───────────────┘   └──────────────────────┘   │
└──────────────────────────────────────────────────┘
                │
        Vercel Edge CDN
    Static files served globally
```

---

## 📊 User Workflows

### Client Reservation Flow
```
Register (role: client)
  → Email verification
  → Browse VehiclesPage (filter by availability)
  → Click "Reserve" on a vehicle
  → Select start/end dates (total price auto-calculated)
  → Upload driver's license photo
  → Submit → reservation status: PENDING
  → MyReservationsPage → await owner action
  → Status → CONFIRMED or REJECTED
  → If confirmed: owner may send notification with details
```

### Owner Management Flow
```
Register (role: owner, agency name set)
  → Email verification
  → OwnerDashboard (stats: vehicles, pending, confirmed)
  → ManageVehiclesPage → Add vehicle (brand, model, price, images)
  → ManageReservationsPage → see incoming PENDING requests
  → View client's license → Confirm or Reject
  → DB trigger auto-rejects competing pending reservations
  → Send notification to client via NotificationsPage
```

---

## ✅ Feature Status

| Feature | Status | Notes |
|---|---|---|
| Email/password authentication | ✅ Implemented | Supabase Auth with email verification |
| Role-based access (client/owner) | ✅ Implemented | Frontend guards + RLS backend enforcement |
| 2-step animated registration | ✅ Implemented | Role selector, agency name field for owners |
| Vehicle CRUD | ✅ Implemented | Add, edit, delete with multi-image gallery |
| Vehicle browsing + search | ✅ Implemented | Live filter by brand/model/plate |
| Reservation booking | ✅ Implemented | Date picker, duration calc, license upload |
| Auto-rejection trigger | ✅ Implemented | PostgreSQL trigger prevents overbooking |
| License viewing for owners | ✅ Implemented | Signed URL with loading state |
| In-app notifications | ✅ Implemented | Real-time via Supabase Realtime WebSocket |
| Notification broadcast | ✅ Implemented | Target all clients or specific user |
| Profile management | ✅ Implemented | Name, phone, agency name, avatar crop/upload |
| Avatar upload with crop | ✅ Implemented | react-easy-crop, private storage bucket |
| Dashboard analytics | ⚠️ Partial | Animated counters, no charts yet |
| Payment integration | ❌ Planned | Would use Stripe |
| Cancellation/refund policy | ❌ Planned | Business logic to define |
| AI chatbot | 🔧 Scaffolded | Gemini + n8n dependencies present |

---

## 🐛 Known Issues & TODOs

| # | Issue | Impact | Fix |
|---|---|---|---|
| 1 | Missing `.env` → app uses mock Supabase client (no DB) | Critical | Create `.env` from template |
| 2 | `agency_name` column requires manual SQL migration if DB already exists | Medium | Run `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agency_name TEXT` |
| 3 | No image optimization — vehicle photos loaded at full resolution | Performance | Use Supabase image transforms or a CDN like Cloudinary |
| 4 | No test suite | Quality | Add Vitest + React Testing Library |
| 5 | License storage RLS uses LIKE query — may be slow at scale | Performance | Switch to a `license_path` column for direct path lookup |
| 6 | No pagination on vehicle list — loads all vehicles at once | Scalability | Add Supabase `.range()` with infinite scroll |
| 7 | Framer Motion `motion.form` not ideal for accessibility | UX | Replace with `motion.div` wrapper around native `<form>` |

---

## 📈 Scalability Considerations

### Current Capacity (Free Tier)
- ~50,000 monthly active users (Supabase Auth limit)
- 500MB PostgreSQL storage
- 1GB file storage
- 2GB bandwidth/month

### Scaling Path
| Threshold | Action |
|---|---|
| > 50k MAU | Upgrade Supabase to Pro ($25/mo) |
| > 500 concurrent DB connections | Enable PgBouncer connection pooling |
| Large vehicle image uploads | Add Supabase image transformations or Cloudinary |
| Complex analytics queries | Add read replica or materialized views |
| Real payment flows | Integrate Stripe Checkout + webhooks |
| Booking confirmation emails | Add Supabase Edge Functions with Resend/SendGrid |

---

## 📚 References

| Resource | URL |
|---|---|
| Supabase Docs | https://supabase.com/docs |
| React Router v6 | https://reactrouter.com/ |
| Vite | https://vitejs.dev/ |
| Tailwind CSS | https://tailwindcss.com/ |
| Framer Motion | https://www.framer.com/motion/ |
| Vercel Docs | https://vercel.com/docs |
| Supabase RLS Guide | https://supabase.com/docs/guides/auth/row-level-security |
| Supabase Realtime | https://supabase.com/docs/guides/realtime |
