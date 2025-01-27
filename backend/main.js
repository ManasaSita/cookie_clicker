import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Jobs
import handleClick from './jobs/clickHandler.js';
import User from './models/UserSchema.js';

// Load environment variables
dotenv.config();

const app = express();

const cors = require('cors');
const allowedOrigins = [
  'http://localhost:3000', // For local development
  'https://cookie-clicker-plum.vercel.app/' // our deployed domain
];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true 
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Click endpoint
app.post('/api/click', async (req, res) => {
  const { userId } = req.body;
  
  try {
    const clickResult = await handleClick(userId);
    res.json(clickResult);
  } catch (error) {
    console.error('Click processing error:', error);
    res.status(500).json({ error: 'Click processing failed' });
  }
});

// Get user stats
app.get('/api/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findOne({ userId });
    res.json(user || { totalScore: 0, totalClicks: 0, prizeCount: 0 });
  } catch (error) {
    console.error('User stats fetch error:', error);
    res.status(500).json({ error: 'Unable to fetch user stats' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});