// models/UserSchema.js
import mongoose from 'mongoose';

const activeEffectSchema = new mongoose.Schema({
  type: { type: String, required: true },
  duration: { type: Number },
  startTime: { type: Number },
  remainingClicks: { type: Number },
  multiplier: { type: Number }
}, { _id: false });

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  totalScore: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
  prizes: [{
    name: String,
    timestamp: Date
  }],
  activeEffects: [activeEffectSchema]
});

export default mongoose.model('User', userSchema);