// backend/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import forSaleRoutes from './routes/forSaleRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

import http from 'http';
import { Server } from 'socket.io';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Socket.io
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: corsOptions });

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
});

// Test route
app.get('/api', (req, res) => {
  res.send('API Fixsy berjalan...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forsale', forSaleRoutes);
app.use('/api/events', eventRoutes);

// === Serve Frontend in Production ===
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, 'public');
  app.use(express.static(frontendPath));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

// Server listen
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`Server berjalan pada port ${PORT}`)
);
