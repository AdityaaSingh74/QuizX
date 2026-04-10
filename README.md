<div align="center">

# �� QuizX - Interactive AI-Powered Quiz Platform

**A full-stack interactive quiz application built with Flask, Python, and Supabase.**

This project has been redesigned into a fast, lightweight, and server-rendered web app using Python, Flask, and Vanilla frontend technologies. Features role-based access control, quiz management, and real-time result tracking.

![Deployment Status](https://img.shields.io/badge/Status-Deployed-success)

**Live Demo:** [https://srs-project-ddku.vercel.app/auth/login](https://srs-project-ddku.vercel.app/auth/login)

</div>

---

## ✨ Core Features

*   **Server-Side Rendering:** Lightning-fast rendering using Flask and Jinja2 templates, removing heavy JavaScript bundles.
*   **Role-Based Access Control**:
    *   **Admin Dashboard**: Comprehensive tools to create and delete quizzes and questions. View all user results globally.
    *   **Student Dashboard**: Take assigned quizzes, view personal scores, and access profile analytics.
*   **Secure Authentication**: Robust Sign-up and Login system using session management and bcrypt password hashing.
*   **Cloud PostgreSQL Database**: Fully powered by Supabase for reliable, scalable, and responsive cloud storage.

---

## 🛠️ Tech Stack

*   **Frontend**: HTML5, Vanilla JavaScript, CSS3, Jinja2 Templates.
*   **Backend**: Python, Flask.
*   **Database**: Supabase (PostgreSQL) - cloud-based.
*   **Authentication**: Flask Sessions, passwords securely hashed via `bcrypt`.

---

## 📂 Project Structure

```bash
SRS_project/
├── .env.example        # Example environment variables
├── requirements.txt    # Python dependencies
├── app.py              # Flask server and main application routes
├── static/             # Static assets (custom CSS, JS, images)
└── templates/          # Jinja2 HTML templates (Dashboard, Quiz, Login)
```

---

## 📋 Prerequisites

Ensure you have the following installed before starting:
*   [Python 3.8+](https://www.python.org/downloads/)
*   `pip` (Python package installer)
*   A [Supabase](https://supabase.com/) account (free tier works perfectly)

---

## ⚙️ Local Development Setup

Follow these instructions exactly to get the project up and running locally.

### 1. Clone the Repository
```bash
git clone https://github.com/AdityaaSingh74/SRS_project.git
cd SRS_project
```

### 2. Create a Virtual Environment (Recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Copy the sample environment file to create your local `.env`:
```bash
cp .env.example .env
```

Open `.env` and fill in the required variables:
```env
# Flask Session Secret
JWT_SECRET="your_secure_random_jwt_secret_here"

# Supabase Configurations (Critical)
SUPABASE_URL="your_supabase_project_url"
SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 5. Supabase Database Setup 
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
> **⚠️ Important Notice**: Do **not** enable Row Level Security (RLS) on these tables via the Supabase dashboard unless you rewrite the backend queries. The application currently securely handles database access through its own Python logic.

### 6. Running the Application
Start the Flask development server:
```bash
python app.py
```
The application runs locally on `http://localhost:5000`.

**Demo Accounts:**  
On the very first launch, the app automatically seeds these credentials so you can log in immediately:
*   **Admin Access**: Email: `admin@quizx.com` | Password: `admin123`
*   **Student Access**: Email: `student@quizx.com` | Password: `student123`

---

## 🤝 Contributing
1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

> Built with ❤️ by AdityaaSingh74 and contributors.
