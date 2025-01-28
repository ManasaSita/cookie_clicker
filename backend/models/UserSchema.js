import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  totalScore: {
    type: Number,
    default: 0
  },
  totalClicks: {
    type: Number,
    default: 0
  },
  prizes: [{
    name: String,
    timestamp: Date
  }],
  activeEffects: [{
    type: {
      type: String,
      enum: ['doublePoints', 'luckyCharm', 'prizeMultiplier']
    },
    startTime: Date,
    duration: Number,
    remainingClicks: Number,
    multiplier: Number
  }]
});

export default mongoose.model('User', UserSchema);