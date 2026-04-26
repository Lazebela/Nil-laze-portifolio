const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const userRoutes = require('./routes/userroutes');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'MYPORTIFOLIO';
const SESSION_TTL = 1000 * 60 * 60; // 1 hour
const adminSessions = new Map();

app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

const createAdminToken = () => crypto.randomBytes(24).toString('hex');

const verifyAdminSession = (req, res, next) => {
  const authHeader = req.header('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const token = authHeader.slice(7);
  const session = adminSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      adminSessions.delete(token);
    }
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  req.adminToken = token;
  next();
};

app.post('/api/admin/login', (req, res) => {
  const { adminKey } = req.body;

  if (!adminKey || adminKey !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }

  const token = createAdminToken();
  const expiresAt = Date.now() + SESSION_TTL;
  adminSessions.set(token, { expiresAt });

  res.status(200).json({ token, expiresAt });
});

app.post('/api/admin/logout', verifyAdminSession, (req, res) => {
  adminSessions.delete(req.adminToken);
  res.status(200).json({ success: true });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { firstname, lastname, email, subject, message } = req.body;
  if (!firstname || !lastname || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const db = require('./config/db');
    const [result] = await db.query(
      'INSERT INTO users (firstname, lastname, email, subject, message) VALUES (?, ?, ?, ?, ?)',
      [firstname, lastname, email, subject, message]
    );
    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

app.get('/api/admin/submissions', verifyAdminSession, async (req, res) => {
  try {
    const db = require('./config/db');
    const [rows] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Admin submissions error:', error);
    res.status(500).json({ error: 'Unable to fetch submissions' });
  }
});

app.delete('/api/admin/submissions/:id', verifyAdminSession, async (req, res) => {
  try {
    const db = require('./config/db');
    const submissionId = req.params.id;
    
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [submissionId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    
    res.status(200).json({ success: true, message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ error: 'Unable to delete submission' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Portfolio backend running' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
