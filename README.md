# 🚀 AI-Powered Google Business Profile (GBP) Post Manager

An end-to-end, decoupled full-stack web application designed for local businesses and digital marketers to generate, edit, preview, manage, draft, and publish **Google Business Profile (GBP)** posts using **OpenRouter AI** and **MongoDB**.

---

## 🌟 Key Features

- **🤖 AI-Powered Post Generation**: Server-side integration with **OpenRouter AI** generating punchy, local-business optimized posts based on Topic, Post Type, Tone, Language, and CTA.
- **👁️ Live GBP Post Preview**: Real-time visual preview card rendering how the post will look on Google Search and Google Maps.
- **🔒 Secure Authentication**: Robust register, login, and logout flow using **bcrypt** password hashing and **HTTP-Only JWT cookies** (`auth_token`).
- **🛡️ Strict User Isolation & Authorization**: Multi-tenant security ensuring users can only view, edit, draft, and publish their own posts (enforced at database and API levels with HTTP 403/404).
- **📍 Global Mock Locations**: Seeded database with 5 pre-configured Google Business Profile locations (*Apex Dental Care, Downtown Coffee Roasters, Urban Fit Gym, Green Thumb Garden Center, Tech Fix Repair Studio*).
- **📝 Post Lifecycle Management**: Full CRUD support for post creation, content editing, status transition (`draft` vs. `published`), filtering, and deletion.
- **📊 Real-time Dashboard**: Live metrics tracking Total Locations, Total Posts, Draft Posts, and Published Posts computed dynamically from MongoDB.
- **🚨 Fail-Safe Error Handling**: Server-side validation, clean 503 missing API key notices without fallback mocks, and graceful client error alerts.

---

## 🏗️ Architecture & Technology Stack

The project follows a **completely decoupled architecture** with separate client and server applications:

### **Frontend** (`/frontend`)
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Modern UI Components
- **Auth Guard**: Next.js Edge Middleware (`middleware.ts`) for route protection (`/dashboard`, `/locations`, `/posts`, `/posts/create`)
- **API Client**: Custom `apiFetch` wrapper with `credentials: 'include'` for cross-origin HTTP-Only cookie passing

### **Backend** (`/backend`)
- **Runtime**: Node.js & Express API Server
- **Language**: TypeScript (`tsc` & `tsx watch`)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: `jsonwebtoken` (JWT) & `cookie-parser`
- **AI Integration**: OpenRouter REST API (`POST /api/ai/generate`)

---

## 📁 Repository Structure

```
project/
├── backend/                  # Node.js / Express API Server
│   ├── src/
│   │   ├── config/           # Database Connection (MongoDB)
│   │   ├── middleware/       # JWT Auth Middleware (`requireAuth`)
│   │   ├── models/           # Mongoose Schemas (User, Location, Post)
│   │   ├── routes/           # REST API Routes (auth, locations, posts, ai, stats)
│   │   ├── scripts/          # Database Seed (`seed.ts`) & Verification Suite
│   │   └── server.ts         # Express Application Entrypoint
│   ├── .env.example          # Environment Template
│   └── package.json          # Backend Dependencies & Scripts
│
├── frontend/                 # Next.js 14 App Router Frontend
│   ├── src/
│   │   ├── app/              # App Router Pages (/login, /register, /dashboard, /locations, /posts)
│   │   ├── components/       # UI Components (Navbar, PostPreviewCard, AlertBanner)
│   │   └── lib/              # API Client (`api.ts`) & Type Definitions
│   ├── middleware.ts         # Edge Route Protection Middleware
│   ├── .env.example          # Frontend Environment Template
│   └── package.json          # Frontend Dependencies & Scripts
│
├── .gitignore                # Workspace Root Git Ignore
└── README.md                 # Project Documentation
```

---

## ⚡ Quick Start & Setup Guide

### 1️⃣ Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI
- **OpenRouter API Key** *(Optional for AI generation)*: Get an API key from [openrouter.ai](https://openrouter.ai/)

---

### 2️⃣ Environment Configuration

#### Backend Setup (`/backend/.env`)
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/gbp_post_manager
JWT_SECRET=super_secret_jwt_key_gbp_manager_2026
FRONTEND_URL=http://localhost:3000
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

#### Frontend Setup (`/frontend/.env.local`)
Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
JWT_SECRET=super_secret_jwt_key_gbp_manager_2026
```

---

### 3️⃣ Installation & Database Seeding

#### Step A: Install Backend Dependencies & Seed DB
```bash
cd backend
npm install
npm run seed
```
> *This seeds 5 mock Google Business Profile locations into your MongoDB database.*

#### Step B: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

### 4️⃣ Running the Application

Start both servers concurrently in separate terminal windows:

#### Terminal 1 — Start Backend Server (`http://localhost:5000`)
```bash
cd backend
npm run dev
```

#### Terminal 2 — Start Frontend Server (`http://localhost:3000`)
```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Reference

### 🔐 Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user & set HTTP-Only JWT cookie | ❌ |
| `POST` | `/api/auth/login` | Authenticate user & set HTTP-Only JWT cookie | ❌ |
| `POST` | `/api/auth/logout` | Clear auth cookie | ❌ |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | ✅ |

### 📍 Location Endpoints (`/api/locations`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/locations` | List all seeded GBP locations | ✅ |
| `GET` | `/api/locations/:id` | Get location details by ID | ✅ |

### 📝 Post Endpoints (`/api/posts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/posts` | List user's posts (supports `?locationId=` & `?status=`) | ✅ |
| `GET` | `/api/posts/:id` | Get specific post by ID | ✅ |
| `POST` | `/api/posts` | Create a new post (`draft` or `published`) | ✅ |
| `PUT` | `/api/posts/:id` | Update post details or status | ✅ |
| `DELETE` | `/api/posts/:id` | Delete post | ✅ |

### 🤖 AI Generation Endpoint (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/generate` | Generate GBP post content via OpenRouter AI | ✅ |

### 📊 Statistics Endpoint (`/api/stats`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/stats` | Return summary metrics for authenticated user | ✅ |

---

## 🧪 Testing & Verification

The project includes an automated end-to-end verification script covering 14 core assessment requirements:

To execute the test suite:
```bash
cd backend
npx tsx src/scripts/verify-final.ts
```

---

## 📄 License

This project is licensed under the **MIT License**.
