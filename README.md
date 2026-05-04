# 🚗 Auto-Loc — Vehicle Rental Platform

> Projet de Fin de Module — Architecture Cloud & Vibe Programming  
> Stack: React + Vite · Supabase · Vercel

**Live App:** `https://auto-loc.vercel.app` *(update after deploy)*  
**GitHub:** *(update after push)*

---

## 📋 Theme Mapping

| Layer | Entity | Description |
|---|---|---|
| **Table A** — Users | `profiles` (via Supabase Auth) | Clients who browse and reserve vehicles, and Agency Owners who manage their fleet. Role stored as `client` or `owner`. |
| **Table B** — Resources | `vehicles` | Cars listed by agency owners: brand, model, year, plate number, daily price, fuel type, availability status. |
| **Table C** — Interactions | `reservations` | Join table linking a client to a vehicle with start/end dates, total price, and status (`pending`, `confirmed`, `rejected`, `cancelled`). |
| **Storage** — File | `licenses` bucket | Driver's license photo uploaded by the client at reservation time. Stored privately in Supabase Storage with per-user path isolation. |

**Key business rule:** When an owner **confirms** one reservation, a PostgreSQL trigger automatically marks the vehicle as unavailable and **rejects all other pending reservations** for that same vehicle.

---

## 🛠 Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/your-username/auto-loc.git
cd auto-loc
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste & run `supabase/migrations/001_schema.sql`
3. Go to **Storage** → create a bucket named `licenses` (set to **private**)
4. Go to **Authentication → Email Templates → Confirm signup** → paste the content of `supabase/email_verification_template.html`
5. In **Authentication → URL Configuration**, set Site URL to your Vercel domain

### 3. Environment Variables

```bash
cp .env.example .env
```

Fill in your Supabase URL and anon key from **Project Settings → API**.

### 4. Run Locally

```bash
npm run dev
```

### 5. Deploy to Vercel

```bash
# Push to GitHub first, then:
vercel --prod
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel dashboard
```

---

## 🧪 Test Credentials

| Role | Email | Password |
|---|---|---|
| Client | `client@test.com` | `test1234` |
| Agency Owner | `owner@test.com` | `test1234` |

*(Create these accounts after deploying and update here)*

---

## 🏗 Architecture Analysis (Mission 4)

### Q1 — Pourquoi Vercel + Supabase est financièrement plus logique qu'un serveur classique ?

Un projet démarrant from scratch doit éviter les coûts fixes lourds. Un serveur classique représente du **CAPEX** (Capital Expenditure) : achat de machines, licences, infrastructure réseau, climatisation — des dépenses immobilisées avant même d'avoir un seul utilisateur.

Vercel et Supabase relèvent de l'**OPEX** (Operational Expenditure) : on paie uniquement ce qu'on consomme, mensuellement. Supabase offre une base PostgreSQL hébergée, une API auto-générée, le stockage de fichiers et l'authentification dans un seul plan gratuit (500MB DB, 1GB Storage, 50.000 utilisateurs actifs/mois). Vercel déploie automatiquement depuis GitHub avec un CDN mondial inclus, sans configurer aucun serveur.

Le résultat : **zéro investissement initial**, une mise en production en minutes, et une structure de coûts qui évolue proportionnellement aux revenus. Pour un extranet métier de validation académique ou une startup early-stage, ce modèle est financièrement rationnel.

---

### Q2 — Comment Vercel gère-t-il la scalabilité par rapport à un Data Center physique ?

Un data center physique est dimensionné pour le **pic** prévisible — on achète des serveurs rack, on prévoit la climatisation et l'alimentation redondante pour 10.000 utilisateurs simultanés même si on n'en a que 50 au quotidien. La capacité inutilisée est gaspillée, et la montée en charge demande semaines de procurement.

Vercel déploie l'application en tant que **Serverless Functions** et **Edge Network**. Chaque requête utilisateur est servie par une fonction éphémère instanciée à la demande sur le datacenter le plus proche géographiquement. Il n'y a aucun serveur « en veille » : la scalabilité est **automatique, instantanée et géographique**. 100 utilisateurs ou 100.000 — Vercel ajuste sans intervention manuelle, sans climatisation à gérer, sans rack à déplacer.

Notre frontend React est servi via le CDN Vercel en fichiers statiques (dist/), ce qui signifie des temps de chargement quasi-nuls quel que soit l'emplacement du client.

---

### Q3 — Donnée Structurée vs Donnée Non-structurée dans Auto-Loc

**Données structurées** : tout ce qui vit dans PostgreSQL via Supabase. Les tables `profiles`, `vehicles`, et `reservations` contiennent des données typées, indexées, liées par des clés étrangères et interrogeables via SQL. Par exemple : `daily_price NUMERIC(10,2)`, `status TEXT CHECK(...)`, `start_date DATE`. Ces données sont parfaitement structurées, cohérentes, et permettent des requêtes relationnelles complexes (ex: toutes les réservations confirmées d'un owner).

**Données non-structurées** : les photos de permis de conduire uploadées dans **Supabase Storage**. Ce sont des fichiers binaires (JPEG, PNG) sans schéma défini, stockés dans un bucket objet (`licenses/{user_id}/{timestamp}.jpg`). Leur contenu ne peut pas être interrogé via SQL — on les référence uniquement par leur chemin. Ce modèle de stockage objet est le standard cloud pour les fichiers non-structurés, opposé à la rigidité d'une colonne relationnelle.

---

## 📁 Project Structure

```
auto-loc/
├── src/
│   ├── components/
│   │   ├── layout/     # Navbar, ClientLayout, OwnerLayout
│   │   └── ui/         # Button, Input, Modal, Badge, Select
│   ├── contexts/
│   │   └── AuthContext.jsx   # Session, profile, role management
│   ├── lib/
│   │   └── supabase.js       # Supabase client
│   ├── pages/
│   │   ├── auth/             # Login, Register, VerifyEmail
│   │   ├── client/           # Dashboard, Vehicles, MyReservations
│   │   └── owner/            # Dashboard, ManageVehicles, ManageReservations
│   └── App.jsx               # Router + role-based guards
├── supabase/
│   ├── migrations/001_schema.sql         # Tables, RLS, triggers
│   └── email_verification_template.html  # Custom email
├── vercel.json    # SPA rewrite rules
└── .env.example   # Environment variables template
```
