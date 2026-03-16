import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-quizx';

app.use(express.json());

// --- Database Configuration ---
// The backend is preset to work with Supabase. If SUPABASE_URL and SUPABASE_ANON_KEY 
// are provided in the environment, it will use Supabase. Otherwise, it falls back to SQLite.
const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
let supabase: any = null;

if (useSupabase) {
  console.log('Using Supabase as the database backend.');
  supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  /*
  Supabase Schema Requirements:
  Run this SQL in your Supabase SQL Editor:
  
  CREATE TABLE users ( id UUID PRIMARY KEY, email TEXT UNIQUE, password TEXT, display_name TEXT, role TEXT );
  CREATE TABLE quizzes ( id UUID PRIMARY KEY, title TEXT, description TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
  CREATE TABLE questions ( id UUID PRIMARY KEY, quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE, text TEXT, option_a TEXT, option_b TEXT, option_c TEXT, option_d TEXT, correct_option TEXT );
  CREATE TABLE results ( id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), quiz_id UUID REFERENCES quizzes(id), score INTEGER, total INTEGER, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() );
  */
}

// Initialize SQLite Database (Fallback)
const db = new Database('quizx.db');

if (!useSupabase) {
  console.log('Using SQLite as the database backend.');
  // Setup Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT,
      display_name TEXT,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT,
      text TEXT,
      option_a TEXT,
      option_b TEXT,
      option_c TEXT,
      option_d TEXT,
      correct_option TEXT,
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      quiz_id TEXT,
      score INTEGER,
      total INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
    );
  `);

  // Seed Admin User
  const adminEmail = 'admin@quizx.com';
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (id, email, password, display_name, role) VALUES (?, ?, ?, ?, ?)').run(
      crypto.randomUUID(),
      adminEmail,
      hashedPassword,
      'Admin',
      'admin'
    );
  }

  // Seed Demo Student
  const studentEmail = 'student@quizx.com';
  const existingStudent = db.prepare('SELECT * FROM users WHERE email = ?').get(studentEmail);
  if (!existingStudent) {
    const hashedPassword = bcrypt.hashSync('student123', 10);
    db.prepare('INSERT INTO users (id, email, password, display_name, role) VALUES (?, ?, ?, ?, ?)').run(
      crypto.randomUUID(),
      studentEmail,
      hashedPassword,
      'Demo Student',
      'student'
    );
  }
}

// Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
};

// API Routes

// Auth
app.post('/api/auth/register', async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password || !display_name) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = crypto.randomUUID();
    
    if (useSupabase) {
      const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
      if (existing) return res.status(400).json({ error: 'Email already exists' });
      
      const { error } = await supabase.from('users').insert([{ id, email, password: hashedPassword, display_name, role: 'student' }]);
      if (error) throw error;
    } else {
      db.prepare('INSERT INTO users (id, email, password, display_name, role) VALUES (?, ?, ?, ?, ?)').run(
        id, email, hashedPassword, display_name, 'student'
      );
    }
    
    const token = jwt.sign({ id, email, role: 'student' }, JWT_SECRET);
    res.json({ token, user: { id, email, display_name, role: 'student' } });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or database error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  let user: any;
  
  if (useSupabase) {
    const { data } = await supabase.from('users').select('*').eq('email', email).single();
    user = data;
  } else {
    user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role } });
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  let user: any;
  if (useSupabase) {
    const { data } = await supabase.from('users').select('id, email, display_name, role').eq('id', req.user.id).single();
    user = data;
  } else {
    user = db.prepare('SELECT id, email, display_name, role FROM users WHERE id = ?').get(req.user.id);
  }
  res.json({ user });
});

app.put('/api/users/profile', authenticateToken, async (req: any, res) => {
  const { display_name } = req.body;
  if (useSupabase) {
    await supabase.from('users').update({ display_name }).eq('id', req.user.id);
  } else {
    db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run(display_name, req.user.id);
  }
  res.json({ success: true });
});

// Quizzes
app.get('/api/quizzes', authenticateToken, async (req: any, res) => {
  let quizzes;
  if (useSupabase) {
    const { data } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
    quizzes = data;
  } else {
    quizzes = db.prepare('SELECT * FROM quizzes ORDER BY created_at DESC').all();
  }
  res.json(quizzes);
});

app.post('/api/quizzes', authenticateToken, requireAdmin, async (req: any, res) => {
  const { title, description } = req.body;
  const id = crypto.randomUUID();
  if (useSupabase) {
    await supabase.from('quizzes').insert([{ id, title, description }]);
  } else {
    db.prepare('INSERT INTO quizzes (id, title, description) VALUES (?, ?, ?)').run(id, title, description);
  }
  res.json({ id, title, description });
});

app.delete('/api/quizzes/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  if (useSupabase) {
    await supabase.from('quizzes').delete().eq('id', req.params.id);
  } else {
    db.prepare('DELETE FROM quizzes WHERE id = ?').run(req.params.id);
  }
  res.json({ success: true });
});

// Questions
app.get('/api/quizzes/:id/questions', authenticateToken, async (req: any, res) => {
  let questions: any[] = [];
  if (useSupabase) {
    const { data } = await supabase.from('questions').select('*').eq('quiz_id', req.params.id);
    questions = data || [];
  } else {
    questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(req.params.id);
  }
  
  // Hide correct_option for students
  if (req.user.role !== 'admin') {
    questions.forEach((q: any) => delete q.correct_option);
  }
  res.json(questions);
});

app.post('/api/quizzes/:id/questions', authenticateToken, requireAdmin, async (req: any, res) => {
  const { text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  const id = crypto.randomUUID();
  if (useSupabase) {
    await supabase.from('questions').insert([{ id, quiz_id: req.params.id, text, option_a, option_b, option_c, option_d, correct_option }]);
  } else {
    db.prepare('INSERT INTO questions (id, quiz_id, text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, req.params.id, text, option_a, option_b, option_c, option_d, correct_option
    );
  }
  res.json({ id });
});

app.delete('/api/questions/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  if (useSupabase) {
    await supabase.from('questions').delete().eq('id', req.params.id);
  } else {
    db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  }
  res.json({ success: true });
});

// Results
app.post('/api/results', authenticateToken, async (req: any, res) => {
  const { quiz_id, answers } = req.body; // answers: { question_id: selected_option }
  let questions: any[] = [];
  
  if (useSupabase) {
    const { data } = await supabase.from('questions').select('id, correct_option').eq('quiz_id', quiz_id);
    questions = data || [];
  } else {
    questions = db.prepare('SELECT id, correct_option FROM questions WHERE quiz_id = ?').all(quiz_id);
  }
  
  let score = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correct_option) {
      score++;
    }
  });

  const id = crypto.randomUUID();
  if (useSupabase) {
    await supabase.from('results').insert([{ id, user_id: req.user.id, quiz_id, score, total: questions.length }]);
  } else {
    db.prepare('INSERT INTO results (id, user_id, quiz_id, score, total) VALUES (?, ?, ?, ?, ?)').run(
      id, req.user.id, quiz_id, score, questions.length
    );
  }

  res.json({ score, total: questions.length });
});

app.get('/api/results', authenticateToken, async (req: any, res) => {
  let results;
  if (useSupabase) {
    if (req.user.role === 'admin') {
      const { data } = await supabase
        .from('results')
        .select('*, quizzes(title), users(display_name)')
        .order('created_at', { ascending: false });
      
      results = data?.map((r: any) => ({
        ...r,
        quiz_title: r.quizzes?.title,
        user_name: r.users?.display_name
      })) || [];
    } else {
      const { data } = await supabase
        .from('results')
        .select('*, quizzes(title)')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });
        
      results = data?.map((r: any) => ({
        ...r,
        quiz_title: r.quizzes?.title
      })) || [];
    }
  } else {
    if (req.user.role === 'admin') {
      results = db.prepare(`
        SELECT r.*, q.title as quiz_title, u.display_name as user_name 
        FROM results r 
        JOIN quizzes q ON r.quiz_id = q.id 
        JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `).all();
    } else {
      results = db.prepare(`
        SELECT r.*, q.title as quiz_title 
        FROM results r 
        JOIN quizzes q ON r.quiz_id = q.id 
        WHERE r.user_id = ?
        ORDER BY r.created_at DESC
      `).all(req.user.id);
    }
  }
  res.json(results);
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
