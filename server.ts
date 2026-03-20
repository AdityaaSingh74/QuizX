import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-quizx';

app.use(express.json());

// --- Supabase Configuration ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n======================================================');
  console.error('❌ MISSING SUPABASE CONFIGURATION ❌');
  console.error('======================================================');
  console.error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in your .env file.');
  console.error('======================================================\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Connected to Supabase.');

// --- Seed Default Accounts on Startup ---
async function seedDefaultUsers() {
  const adminEmail = 'admin@quizx.com';
  const { data: existingAdmin } = await supabase.from('users').select('id').eq('email', adminEmail).single();
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await supabase.from('users').insert([{ id: crypto.randomUUID(), email: adminEmail, password: hashedPassword, display_name: 'Admin', role: 'admin' }]);
    console.log('✅ Seeded admin@quizx.com');
  }

  const studentEmail = 'student@quizx.com';
  const { data: existingStudent } = await supabase.from('users').select('id').eq('email', studentEmail).single();
  if (!existingStudent) {
    const hashedPassword = bcrypt.hashSync('student123', 10);
    await supabase.from('users').insert([{ id: crypto.randomUUID(), email: studentEmail, password: hashedPassword, display_name: 'Demo Student', role: 'student' }]);
    console.log('✅ Seeded student@quizx.com');
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

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const { error } = await supabase.from('users').insert([{ id, email, password: hashedPassword, display_name, role: 'student' }]);
    if (error) throw error;

    const token = jwt.sign({ id, email, role: 'student' }, JWT_SECRET);
    res.json({ token, user: { id, email, display_name, role: 'student' } });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or database error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const { data: user } = await supabase.from('users').select('*').eq('email', email).single();

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role } });
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  const { data: user } = await supabase.from('users').select('id, email, display_name, role').eq('id', req.user.id).single();
  res.json({ user });
});

app.put('/api/users/profile', authenticateToken, async (req: any, res) => {
  const { display_name } = req.body;
  await supabase.from('users').update({ display_name }).eq('id', req.user.id);
  res.json({ success: true });
});

// Quizzes
app.get('/api/quizzes', authenticateToken, async (req: any, res) => {
  const { data: quizzes } = await supabase.from('quizzes').select('*').order('created_at', { ascending: false });
  res.json(quizzes);
});

app.post('/api/quizzes', authenticateToken, requireAdmin, async (req: any, res) => {
  const { title, description } = req.body;
  const id = crypto.randomUUID();
  await supabase.from('quizzes').insert([{ id, title, description }]);
  res.json({ id, title, description });
});

app.delete('/api/quizzes/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  await supabase.from('quizzes').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// Questions
app.get('/api/quizzes/:id/questions', authenticateToken, async (req: any, res) => {
  const { data: questions } = await supabase.from('questions').select('*').eq('quiz_id', req.params.id);
  const result = questions || [];

  // Hide correct_option for students
  if (req.user.role !== 'admin') {
    result.forEach((q: any) => delete q.correct_option);
  }
  res.json(result);
});

app.post('/api/quizzes/:id/questions', authenticateToken, requireAdmin, async (req: any, res) => {
  const { text, option_a, option_b, option_c, option_d, correct_option } = req.body;
  const id = crypto.randomUUID();
  await supabase.from('questions').insert([{ id, quiz_id: req.params.id, text, option_a, option_b, option_c, option_d, correct_option }]);
  res.json({ id });
});

app.delete('/api/questions/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  await supabase.from('questions').delete().eq('id', req.params.id);
  res.json({ success: true });
});

// Results
app.post('/api/results', authenticateToken, async (req: any, res) => {
  const { quiz_id, answers } = req.body; // answers: { question_id: selected_option }

  const { data: questions } = await supabase.from('questions').select('id, correct_option').eq('quiz_id', quiz_id);
  const questionList = questions || [];

  let score = 0;
  questionList.forEach((q: any) => {
    if (answers[q.id] === q.correct_option) {
      score++;
    }
  });

  const id = crypto.randomUUID();
  await supabase.from('results').insert([{ id, user_id: req.user.id, quiz_id, score, total: questionList.length }]);

  res.json({ score, total: questionList.length });
});

app.get('/api/results', authenticateToken, async (req: any, res) => {
  let results;

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

  res.json(results);
});

async function startServer() {
  // Seed default accounts into Supabase before starting
  await seedDefaultUsers();

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
