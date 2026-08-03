# CivicSync AI 🏙️

> **AI-Powered Smart Civic Issue Reporting & Management Platform**
> Built for Amalner Municipal Council — and scalable to any Smart City.

---

## 📋 Overview

CivicSync AI allows citizens to report civic issues like potholes, garbage, broken streetlights, and water leaks in under **30 seconds** using a photo and GPS. The platform uses **Gemini Vision AI** to automatically categorize issues and route them to the correct municipal department.

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Maps | React Leaflet + OpenStreetMap |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| AI | Google Gemini Vision API |
| Auth | JWT + Google OAuth |
| Storage | Supabase Storage |

## 📁 Project Structure

```
civics-ai/
├── frontend/          # Next.js App Router frontend
│   └── src/
│       ├── app/       # Pages (routes)
│       │   ├── page.tsx          # Landing Page
│       │   ├── login/            # Authentication
│       │   ├── register/
│       │   ├── dashboard/        # Citizen Dashboard
│       │   ├── report/           # Smart Complaint Form
│       │   ├── admin/            # Municipal Admin Dashboard
│       │   └── worker/           # Worker Dashboard
│       └── components/
│           ├── ui/               # shadcn/ui components
│           └── map/              # Leaflet Map components
└── backend/           # Express.js API server
    ├── prisma/
    │   ├── schema.prisma         # Database schema
    │   └── seed.ts               # Dummy seed data
    └── src/
        ├── controllers/          # Route handlers
        ├── middlewares/          # Auth & RBAC middleware
        ├── routes/               # Express routes
        ├── services/             # Business logic & AI
        └── utils/
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or Supabase/Railway)
- Gemini API Key ([get one here](https://aistudio.google.com/))

### 1. Setup Backend

```bash
cd backend

# Copy env and fill in your values
cp .env.example .env

# Install dependencies
npm install

# Push database schema
npm run db:push

# Seed with demo data
npm run seed

# Start dev server
npm run dev
```

### 2. Setup Frontend

```bash
cd frontend

# Copy env
cp .env.example .env.local

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:3000**
Backend API at: **http://localhost:5000**

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@amalner.gov.in | password123 |
| Citizen | citizen@example.com | password123 |
| Worker | worker@amalner.gov.in | password123 |

## 🌐 Pages

| Path | Description |
|---|---|
| `/` | Landing Page |
| `/login` | Citizen / Admin Login |
| `/register` | Citizen Registration |
| `/dashboard` | Citizen Complaint Tracker |
| `/report` | Smart Complaint Submission Form |
| `/admin` | Municipal Admin Dashboard |
| `/worker` | Field Worker Dashboard |

## 🤖 AI Features

When a user uploads a photo:
1. **Gemini Vision** analyzes the image
2. Automatically detects: Category, Priority, Summary
3. Pre-fills the complaint form
4. User can edit and confirm before submitting

## 📦 Environment Variables

### Backend (`.env`)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="your_secret"
GEMINI_API_KEY="your_gemini_key"
PORT=5000
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🔮 Future Ready Modules
The architecture is ready to extend with:
- Property Tax
- Water Tax
- Birth/Death Certificates
- AI Chatbot
- WhatsApp Bot Integration
- Mobile App (React Native)

---

*Built with ❤️ for Amalner Municipal Council*
