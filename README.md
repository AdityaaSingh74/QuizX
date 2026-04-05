<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🚀 QuizX - Interactive AI-Powered Quiz Platform

**A visually stunning, Pinterest-inspired, modern full-stack interactive quiz application.**
Built with React, Vite, Tailwind CSS, Express, and Supabase (PostgreSQL). Features advanced glassmorphic UI, role-based access control, quiz management, real-time result tracking, and AI integration.

</div>

---

## ✨ Core Features

*   **Premium Modern UI/UX**: Completely overhauled Pinterest-inspired interface featuring glassmorphic elements, card-based layouts, soft color gradients, and smooth Framer Motion animations.
*   **Role-Based Access Control**:
    *   **Admin Dashboard**: comprehensive tools to create, edit, and delete quizzes and questions. View all user results globally.
    *   **Student Dashboard**: Take assigned quizzes, view personal scores, and access profile analytics.
*   **Secure Authentication**: Robust Sign-up and Login system using JSON Web Tokens (JWT) and bcrypt password hashing.
*   **Cloud PostgreSQL Database**: Fully powered by Supabase for reliable, scalable, and responsive cloud storage.
*   **AI Integrations**: Ready for Google GenAI text prompts and processing (via `@google/genai`).

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, React Router DOM, Tailwind CSS v4, Framer Motion, Lucide React, Vite.
*   **Backend**: Node.js, Express, TypeScript (`tsx`).
*   **Database**: Supabase (PostgreSQL) - cloud-based.
*   **Authentication**: Custom JWT (JSON Web Tokens) verification, passwords securely hashed via `bcryptjs`.

---

## 📂 Project Structure

```bash
SRS_project/
├── .env.example        # Example environment variables
├── package.json        # Project metadata and dependencies
├── server.ts           # Express backend server entry point
├── src/                # Frontend source code
│   ├── App.tsx         # Root component & Routing
│   ├── components/     # Reusable UI components (Navbar, UI library)
│   ├── context/        # React context (Auth context)
│   ├── pages/          # Full page views
│   │   ├── AdminDashboard.tsx   # Admin overview and management 
│   │   ├── StudentDashboard.tsx # Student quiz viewing
│   │   ├── QuizAttempt.tsx      # Interactive quiz taking interface
│   │   ├── Login.tsx            # User login
│   │   ├── Register.tsx         # User registration
│   │   └── Profile.tsx          # User profile and stats
│   ├── services/       # API wrapper functions
│   └── index.css       # Tailwind entry and global CSS
└── vite.config.ts      # Vite configuration
```

---

## 📋 Prerequisites

Ensure you have the following installed before starting:
*   [Node.js](https://nodejs.org/en) (v18 or higher recommended)
*   npm, yarn, or pnpm
*   A [Supabase](https://supabase.com/) account (free tier works perfectly)

---

## ⚙️ Local Development Setup

Follow these instructions exactly to get the project up and running locally.

### 1. Clone the Repository
```bash
git clone https://github.com/AdityaaSingh74/SRS_project.git
cd SRS_project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the sample environment file to create your local `.env`:
```bash
cp .env.example .env
```

Open `.env` and fill in the required variables:
```env
# Required for AI features
GEMINI_API_KEY="your_gemini_api_key_here"

# JWT Secret for Auth Token generation
JWT_SECRET="your_secure_random_jwt_secret_here"

# Supabase Configurations (Critical)
SUPABASE_URL="your_supabase_project_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your_supabase_anon_key"
```

### 4. Supabase Database Setup 
Before starting the backend, you need to set up the database tables. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql) and run the following script:

```sql
-- Users Table
CREATE TABLE users ( 
  id UUID PRIMARY KEY, 
  email TEXT UNIQUE, 
  password TEXT, 
  display_name TEXT, 
  role TEXT 
);

-- Quizzes Table
CREATE TABLE quizzes ( 
  id UUID PRIMARY KEY, 
  title TEXT, 
  description TEXT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() 
);

-- Questions Table
CREATE TABLE questions ( 
  id UUID PRIMARY KEY, 
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE, 
  text TEXT, 
  option_a TEXT, 
  option_b TEXT, 
  option_c TEXT, 
  option_d TEXT, 
  correct_option TEXT 
);

-- Results Table
CREATE TABLE results ( 
  id UUID PRIMARY KEY, 
  user_id UUID REFERENCES users(id), 
  quiz_id UUID REFERENCES quizzes(id), 
  score INTEGER, 
  total INTEGER, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() 
);
```
> **⚠️ Important Notice**: Do **not** enable Row Level Security (RLS) on these tables via the Supabase dashboard unless you rewrite the backend queries. The application currently securely handles database access through its own Express middleware and JWT validation layer.

### 5. Running the Application
To run both the Vite frontend and Express backend concurrently:
```bash
npm run dev
```
The application runs locally on `http://localhost:3000`.

**Demo Accounts:**  
On the very first launch, the app automatically seeds these credentials so you can log in immediately:
*   **Admin Access**: Email: `admin@quizx.com` | Password: `admin123`
*   **Student Access**: Email: `student@quizx.com` | Password: `student123`

---

## 📜 Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Starts frontend (Vite) and backend (tsx server.ts) concurrently. |
| `build` | `npm run build` | Builds the Vite frontend app for production. |
| `start` | `npm run start` | Runs the compiled Node JS production server. |
| `lint` | `npm run lint` | Runs TypeScript type checking without emitting files. |
| `clean` | `npm run clean` | Removes the `dist` build directory. |

---

## 🎨 UI/UX Features Overview

This project was recently overhauled to feature:
- **Pinterest-Inspired Dashboards**: Information is organized in dynamic, masonry-like card layouts allowing users to digest content effortlessly.
- **Glassmorphism Design System**: Beautiful transluscent backgrounds, frosted glass effects, and soft gradients (utilizing Tailwind's background blurs).
- **Interactive Tour & HUD**: Inspired by modern game design, elements behave dynamically with micro-animations provided by Framer Motion, reacting precisely to hover states, focus events, and layout transitions.

---

## 🤝 Contributing
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

> Built with ❤️ by AdityaaSingh74 and contributors.
