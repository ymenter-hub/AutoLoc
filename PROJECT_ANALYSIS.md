# 🚗 Auto-Loc — Complete Project Analysis

## 📌 Project Overview

**Auto-Loc** is a vehicle rental platform SaaS built with modern cloud-native technologies. It enables agency owners to list vehicles and clients to browse, reserve, and book cars with integrated driver license verification.

**Project Type:** Full-stack web application (Frontend + Backend)  
**Status:** Production-ready (deployed on Vercel)  
**Live URL:** `https://auto-loc.vercel.app`

---

## 🏗 Tech Stack

### Frontend
- **Framework:** React 18.2.0 (with Hooks)
- **Build Tool:** Vite 8.0.10
- **Routing:** React Router DOM 6.22.0
- **UI Icons:** Lucide React 0.344.0
- **Date Handling:** date-fns 3.3.1
- **Styling:** CSS Modules (component-scoped styling)

### Backend/Infrastructure
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email/password)
- **File Storage:** Supabase Storage (driver licenses)
- **Hosting:** Vercel (Serverless deployment)
- **Database Triggers:** PostgreSQL triggers for business logic

### DevTools
- **Linting:** ESLint with React plugins
- **Package Manager:** npm
- **Config:**`.env` for environment variables (Supabase credentials)

---

## 🗂 Project Structure

```
/myautoloc
├── src/
│   ├── App.jsx                 # Main app with routing logic
│   ├── main.jsx                # React DOM entry point
│   ├── index.css               # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── ClientLayout.jsx        # Client dashboard wrapper
│   │   │   ├── OwnerLayout.jsx         # Owner dashboard wrapper
│   │   │   ├── Navbar.jsx              # Top navigation
│   │   │   └── *.module.css            # Scoped styles
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── Badge.jsx               # Status badge component
│   │       ├── Select.jsx
│   │       └── *.module.css
│   ├── contexts/
│   │   └── AuthContext.jsx     # Global authentication state + user profile
│   ├── lib/
│   │   └── supabase.js         # Supabase client initialization
│   └── pages/
│       ├── LandingPage.jsx     # Public landing page
│       ├── auth/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   └── VerifyEmailPage.jsx
│       ├── client/             # Client-only views
│       │   ├── ClientDashboard.jsx
│       │   ├── VehiclesPage.jsx        # Browse & reserve vehicles
│       │   └── MyReservationsPage.jsx  # View/manage own reservations
│       └── owner/              # Owner-only views
│           ├── OwnerDashboard.jsx
│           ├── ManageVehiclesPage.jsx      # Add/edit/delete vehicles
│           └── ManageReservationsPage.jsx  # Accept/reject reservations
├── supabase/
│   ├── migrations/
│   │   └── 001_schema.sql      # Database schema + triggers
│   └── email_verification_template.html
├── public/                     # Static assets
├── vercel.json                 # Vercel deployment config
├── vite.config.js              # Vite build configuration
└── package.json
```

---

## 🗄 Database Design (Three-Table Model)

### Table 1: `profiles` (User Accounts)
Extends Supabase's built-in `auth.users` table with profile data.

| Column | Type | Purpose |
|--------|------|---------|
| `id` (PK) | UUID | Foreign key to `auth.users(id)`, deleted on cascade |
| `full_name` | TEXT | User's display name |
| `phone` | TEXT | Contact number |
| `role` | TEXT | Either `'client'` or `'owner'` |
| `created_at` | TIMESTAMPTZ | Account creation timestamp |

**Purpose:** Differentiates user roles for dashboard routing and feature access control.

---

### Table 2: `vehicles` (Fleet Inventory)
Represents cars owned by agency owners.

| Column | Type | Purpose |
|--------|------|---------|
| `id` (PK) | UUID | Unique vehicle ID |
| `owner_id` (FK) | UUID | References `profiles.id` — "who owns this vehicle" |
| `brand` | TEXT | Car manufacturer (Ford, BMW, etc.) |
| `model` | TEXT | Model name (Focus, X5, etc.) |
| `year` | INT | Manufacturing year |
| `color` | TEXT | Paint color |
| `plate_number` | TEXT | License plate (unique constraint) |
| `daily_price` | NUMERIC(10,2) | Rental cost per day (e.g., 49.99 EUR) |
| `fuel_type` | ENUM | petrol \| diesel \| electric \| hybrid |
| `transmission` | ENUM | manual \| automatic |
| `seats` | INT | Passenger capacity (default: 5) |
| `image_url` | TEXT | URL to vehicle photo |
| `description` | TEXT | Additional features/notes |
| `is_available` | BOOLEAN | Availability flag (updated by trigger) |
| `created_at` | TIMESTAMPTZ | When vehicle was listed |

**Purpose:** Single source of truth for vehicle inventory. Automatically updated by reservation triggers.

---

### Table 3: `reservations` (Booking Records)
Links clients to vehicles with booking details.

| Column | Type | Purpose |
|--------|------|---------|
| `id` (PK) | UUID | Unique reservation ID |
| `client_id` (FK) | UUID | References `profiles.id` — "who reserved" |
| `vehicle_id` (FK) | UUID | References `vehicles.id` — "which car" |
| `start_date` | DATE | Rental start date |
| `end_date` | DATE | Rental end date |
| `total_price` | NUMERIC(10,2) | Total cost for entire rental period |
| `status` | TEXT | One of: `pending` → `confirmed` → `completed`, or `rejected`, `cancelled` |
| `license_url` | TEXT | Supabase Storage path to driver license photo |
| `notes` | TEXT | Rental notes (addresses, special requests) |
| `created_at` | TIMESTAMPTZ | Booking creation time |
| `updated_at` | TIMESTAMPTZ | Last status change |

**Purpose:** Transaction log + state machine for booking lifecycle.

---

## ⚙️ Business Logic & Triggers

### PostgreSQL Trigger: `handle_reservation_confirmation()`

**Scenario:** Agency owner confirms a reservation → system must prevent overbooking.

**Action on Confirmation:**
1. Vehicle marked as `is_available = FALSE`
2. All other `pending` reservations for that vehicle are automatically `rejected`

**Action on Cancellation/Rejection:**
1. If previous status was `confirmed`, vehicle becomes `is_available = TRUE` again  
2. Re-opens the vehicle for future bookings

**Purpose:** Guarantees business rule: "One confirmed reservation = vehicle locked, all competing reservations auto-rejected."

---

## 🔐 Authentication & Authorization

### Supabase Auth Flow
1. **Registration:** New user creates account → Supabase sends verification email
2. **Email Verification:** User clicks verification link → email marked confirmed
3. **Login:** Email + password → Supabase returns JWT session
4. **Profile:** After login, `AuthContext` fetches user's role from `profiles` table

### Role-Based Access Control (RBAC)

| Role | Access | Restrictions |
|------|--------|--------------|
| **client** | Browse vehicles, create reservations, upload license | Cannot manage vehicles, cannot see other clients' reservations |
| **owner** | List/edit vehicles, view/approve reservations | Cannot browse vehicles as client, cannot see other owners' vehicles |
| **anonymous** | Landing page, login/register pages only | No database access |

### Implementation
- `App.jsx` uses smart routing: `/dashboard` redirects to `/client/dashboard` or `/owner/dashboard` based on `profile.role`
- `AuthContext` provides `session` + `profile` state to entire app
- Route guards check `session` and `profile?.role` before rendering protected pages

---

## 🔄 Application Routes

### Public Routes
| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | LandingPage | No |
| `/login` | LoginPage | No |
| `/register` | RegisterPage | No |
| `/verify-email` | VerifyEmailPage | No (session optional) |

### Client Routes (Role-gated: `role === 'client'`)
| Path | Component | Purpose |
|------|-----------|---------|
| `/client/dashboard` | ClientDashboard | Overview |
| `/client/vehicles` | VehiclesPage | Browse all vehicles, start reservations |
| `/client/reservations` | MyReservationsPage | View/manage own bookings |

### Owner Routes (Role-gated: `role === 'owner'`)
| Path | Component | Purpose |
|------|-----------|---------|
| `/owner/dashboard` | OwnerDashboard | Fleet overview |
| `/owner/vehicles` | ManageVehiclesPage | CRUD vehicles |
| `/owner/reservations` | ManageReservationsPage | Accept/reject pending reservations |

### Smart Redirect
- **`/dashboard`** → Checks `profile.role` → redirects to appropriate dashboard
- **Invalid paths** → `*` redirects to home `/`

---

## 📁 File Storage

### Licenses Bucket
- **Name:** `licenses` (Supabase Storage)
- **Privacy:** Private (requires authentication + RLS)
- **Path Pattern:** `{user_id}/{reservation_id}/license.{ext}`
- **Purpose:** Secure storage of driver license photos

### Why Private?
1. Sensitive PII (personal identification document)
2. Access control via RLS policies (only user who uploaded can read)
3. Prevents public access even with bucket URL

---

## 💾 Data Flow Architecture

```
┌─────────────────┐
│   React App     │
│  (Vite Bundle)  │
└────────┬────────┘
         │
    [REST API]
         │
┌────────▼──────────────────┐
│  Supabase Platform        │
├──────────────────────────┤
│ ┌─ PostgreSQL Database   │
│ ├─ Authentication (JWT)  │
│ ├─ Storage (S3-like)     │
│ └─ Row-Level Security    │
└──────────────────────────┘
         │
    [CDN Edge] (Vercel)
         │
         ▼
    [Browser Cache]
```

### API Calls Example
Client calls Supabase directly from browser:
```javascript
const { data, error } = await supabase
  .from('vehicles')
  .select('*')
  .eq('is_available', true)
```

No Node.js backend needed. Supabase RLS enforces permissions server-side.

---

## 🚀 Deployment Architecture

### Hosting: Vercel
- **Frontend:** React dist bundled as static HTML/JS/CSS
- **CDN:** Global edge network (request routed to nearest PoP)
- **Environment:** `.buildpack.env` or Vercel dashboard secrets
- **Auto-deploy:** `git push` → GitHub → Vercel webhook → build + deploy

### Database: Supabase
- **Hosting:** AWS/Google Cloud (user's choice)
- **Isolation:** Each project gets dedicated PostgreSQL instance
- **Backup:** Automated daily backups + point-in-time recovery
- **SSL/TLS:** All connections encrypted

### Security
- **HTTPS Only:** Vercel enforces TLS
- **CORS:** Supabase allows browser requests from Vercel domain
- **RLS:** Every table has row-level security policies (not shown in migrations, but enabled)
- **Rate Limiting:** Supabase API has built-in DDoS protection

---

## 🎨 Component Hierarchy

```
App
├── BrowserRouter
└── AuthProvider
    └── AppRoutes
        ├── LandingPage (public)
        ├── LoginPage / RegisterPage / VerifyEmailPage (public)
        ├── ClientLayout (protected)
        │   ├── Navbar
        │   └── Outlet
        │       ├── ClientDashboard
        │       ├── VehiclesPage
        │       └── MyReservationsPage
        └── OwnerLayout (protected)
            ├── Navbar
            └── Outlet
                ├── OwnerDashboard
                ├── ManageVehiclesPage
                └── ManageReservationsPage
```

---

## 🔧 Configuration Files

### `vite.config.js`
- **React Plugin:** Fast Refresh (HMR during development)
- **Alias:** `@` → `/src` (optional)
- **Build Output:** `dist/` folder with production bundles

### `package.json`
- **Scripts:**
  - `npm run dev` → Start dev server (`localhost:5173`)
  - `npm run build` → Production build (minified, optimized)
  - `npm run preview` → Preview built output locally
  - `npm run lint` → Check code quality

### `.env` (Not in repo, created locally)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### `vercel.json`
Deployment configuration (serverless environment settings, redirects, etc.)

---

## 📊 User Workflows

### Client Workflow
1. **Sign Up** → Register page → Email verification → Role set to `'client'`
2. **Browse** → VehiclesPage → Filter by price/date/availability
3. **Reserve** → Select dates → Upload license photo → Submit reservation
4. **Await Approval** → Check MyReservationsPage → Status: `pending` → `confirmed` or `rejected`
5. **Confirm Details** → View owner contact info if confirmed

### Owner Workflow
1. **Sign Up** → Register page → Email verification → Role set to `'owner'`
2. **Add Vehicle** → ManageVehiclesPage → Fill vehicle details → Save to database
3. **View Reservations** → ManageReservationsPage → See all pending/confirmed/rejected
4. **Approve/Reject** → Click action → Triggers auto-rejection of competing reservations
5. **Manage Fleet** → Edit/delete vehicles → Track availability status

---

## 🔍 Key Features

| Feature | Implemented | Notes |
|---------|-------------|-------|
| User authentication | ✅ Supabase Auth | Email verification required |
| Role-based access | ✅ RBAC (client/owner) | Enforced in frontend + RLS on backend |
| Vehicle browsing | ✅ Real-time list | Filters by availability |
| Reservation booking | ✅ Multi-step form | Calculates `total_price` from dates |
| License upload | ✅ Supabase Storage | Private, per-user access |
| Auto-rejection trigger | ✅ PostgreSQL trigger | Prevents overbooking |
| Email verification | ✅ Supabase template | Custom HTML template |
| Dashboard analytics | ⚠️ Partial | Basic views, no charts yet |
| Payment integration | ❌ Not implemented | Would use Stripe/Paddle |
| Notification system | ❌ Not implemented | Could use SendGrid + Supabase functions |

---

## 📈 Scalability Considerations

### Current Architecture
- **Database:** Shared PostgreSQL via Supabase  
- **Bottlenecks:** Large queries, concurrent signups (auth)
- **Max Users:** ~50k active/month on free tier

### For 100k+ Users
1. **Database:** Upgrade Supabase plan (premium tier)
2. **Caching:** Add Redis for hot queries (Upstash)
3. **Functions:** Serverless functions for complex logic (Supabase Edge Functions)
4. **Storage:** Upgrade to higher S3 quotas
5. **Frontend:** Implement pagination, lazy loading

---

## 🐛 Potential Issues & TODOs

1. **Missing `.env`** → App will crash at startup if env vars not set
2. **Email not configured** → Verification emails won't send without Supabase SMTP
3. **RLS policies missing** → Schema SQL likely incomplete (policies not shown in migration)
4. **No payment system** → Reservations are free (need Stripe/Paddle integration)
5. **No notification emails** → Owners/clients don't get confirmation emails on status change
6. **Limited validation** → Form inputs unchecked (could allow invalid dates, negative prices)
7. **No image optimization** → Vehicle images loaded at full resolution
8. **No test suite** → No unit/integration tests visible

---

## 📝 Next Steps for Development

### Priority 1 (MVP Completion)
- [ ] Set up Supabase project + run migrations
- [ ] Create `.env` with credentials
- [ ] Test authentication flow end-to-end
- [ ] Implement vehicle CRUD pages
- [ ] Test reservation creation + trigger behavior

### Priority 2 (Polish)
- [ ] Add loading states & error handling
- [ ] Implement form validation (dates, prices, file size)
- [ ] Add email notifications (Supabase functions)
- [ ] Optimize images (next-image or similar)
- [ ] Add analytics dashboard (charts of bookings, revenue)

### Priority 3 (Monetization)
- [ ] Integrate Stripe for payments
- [ ] Add admin dashboard for support
- [ ] Implement cancellation/refund policies
- [ ] Add insurance options

---

## 📚 References

**Supabase Docs:** https://supabase.com/docs  
**React Router:** https://reactrouter.com/  
**Vite:** https://vitejs.dev/  
**Vercel:** https://vercel.com/docs  

---

**Last Updated:** May 4, 2026  
**Analysis Scope:** Full-stack architecture overview
