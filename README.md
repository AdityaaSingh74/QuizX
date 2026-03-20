<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# QuizX - Interactive Quiz Platform

QuizX is a modern, full-stack interactive quiz application built with React, Vite, Tailwind CSS, Express, and Supabase (PostgreSQL). It features user authentication, role-based access control, quiz creation, and result tracking.

## Features

*   **User Authentication**: Secure Sign-up and Login using JWT and bcrypt.
*   **Role-Based Access Control**:
    *   **Admin**: Create, edit, and delete quizzes and questions. View all student results.
    *   **Student**: Take assigned quizzes and view personal scores.
*   **Cloud Database**: Powered by Supabase (PostgreSQL) for reliable, scalable cloud storage.
*   **Responsive UI**: Modern interface built with Tailwind CSS and Framer Motion for smooth animations.

## Tech Stack

*   **Frontend**: React 19, React Router DOM, Tailwind CSS (v4), Framer Motion, Lucide React, Vite.
*   **Backend**: Node.js, Express, TypeScript (tsx).
*   **Database**: Supabase (PostgreSQL, Cloud).
*   **Authentication**: JSON Web Tokens (JWT), validation via `bcryptjs`.
*   **AI Integration**: Setup for Google GenAI (`@google/genai`).

## Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (or yarn / pnpm)

## Local Development Setup

1.  **Clone the Repository** and navigate to the project directory:
    ```bash
    cd SRS_project
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    Copy the `.env.example` file to create a new `.env.local` or `.env` file:
    ```bash
    cp .env.example .env
    ```
    Configure the variables in the `.env` file:
    *   `GEMINI_API_KEY`: Add your Gemini AI API key if utilizing AI features.
    *   `JWT_SECRET`: Secret key for JWT signing.
    *   `SUPABASE_URL` & `SUPABASE_ANON_KEY`: **(Required)** Your Supabase project URL and Anon Key.

4.  **Run the Application**:
    ```bash
    npm run dev
    ```
    The application will automatically seed the following demo accounts into Supabase on first launch:
    *   **Admin**: `admin@quizx.com` / `admin123`
    *   **Student**: `student@quizx.com` / `student123`

    *The frontend and backend will run concurrently on `http://localhost:3000`.*

## Supabase Setup (Required)

Before running the app, create a free project at [supabase.com](https://supabase.com) and run the following SQL in the **SQL Editor** to create the required tables:

```sql
CREATE TABLE users ( id UUID PRIMARY KEY, email TEXT UNIQUE, password TEXT, display_name TEXT, role TEXT );
CREATE TABLE quizzes ( id UUID PRIMARY KEY, title TEXT, description TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
CREATE TABLE questions ( id UUID PRIMARY KEY, quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE, text TEXT, option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT, correct_option TEXT );
CREATE TABLE results ( id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), quiz_id UUID REFERENCES quizzes(id), score INTEGER, total INTEGER, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
```

Then add your `SUPABASE_URL` and `SUPABASE_ANON_KEY` to the `.env` file. The app will handle seeding demo accounts automatically.

> **Note**: Do **not** enable Row Level Security (RLS) on these tables unless you intend to manage it yourself — the app uses its own JWT-based authorization layer.

## Build for Production

1.  **Build the Vite package**:
    ```bash
    npm run build
    ```
2.  **Start the production server**:
    ```bash
    npm run start
    ```
