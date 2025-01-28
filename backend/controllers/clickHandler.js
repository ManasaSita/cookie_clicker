// controllers/clickHandler.js
import User from '../models/UserSchema.js';
import { PRIZES, ACTIVE_EFFECTS } from '../config/constants.js';

const handleActiveEffects = (activeEffects, scoreIncrease) => {
  let finalScoreIncrease = scoreIncrease;
  const updatedEffects = [];
  const now = Date.now();
  
  activeEffects.forEach(effect => {
    switch(effect.type) {
      case 'doublePoints':
        if (now - effect.startTime < effect.duration) {
          finalScoreIncrease *= 2;
          updatedEffects.push(effect);
        }
        break;
      
      case 'luckyCharm':
        if (effect.remainingClicks > 0) {
          finalScoreIncrease += 10;
          effect.remainingClicks--;
          if (effect.remainingClicks > 0) {
            updatedEffects.push(effect);
          }
        }
        break;
      
      case 'prizeMultiplier':
        if (effect.remainingClicks > 0) {
          finalScoreIncrease *= effect.multiplier;
          effect.remainingClicks--;
          if (effect.remainingClicks > 0) {
            updatedEffects.push(effect);
          }
        }
        break;
    }
  });

  return { finalScoreIncrease, updatedEffects };
};

const handleClick = async (userId) => {
  try {
    let user = await User.findOne({ userId });
    
    if (!user) {
      user = new User({ 
        userId, 
        totalScore: 0, 
        totalClicks: 0, 
        prizes: [], 
        activeEffects: [] 
      });
    }
      
    const randomValue = Math.random();
    let scoreIncrease = randomValue < 0.5 ? 10 : 1;
    let prize = null;

    // Prize logic
    if (Math.random() < 0.25) {
      const selectedPrize = PRIZES.find(p => Math.random() < p.chance);
      if (selectedPrize) {
        prize = selectedPrize;
        scoreIncrease += selectedPrize.pointIncrease;
      }
    }

    // Random chance to add new effects
    if (Math.random() < 0.1 && user.activeEffects.length < 2) {
      const effectTypes = Object.keys(ACTIVE_EFFECTS);
      const randomEffect = ACTIVE_EFFECTS[effectTypes[Math.floor(Math.random() * effectTypes.length)]];
      if (!user.activeEffects.find(e => e.type === randomEffect.type)) {
        // Create a clean effect object that matches the schema
        const newEffect = {
          type: randomEffect.type,
          duration: randomEffect.duration || undefined,
          startTime: Date.now(),
          remainingClicks: randomEffect.remainingClicks || undefined,
          multiplier: randomEffect.multiplier || undefined
        };
        user.activeEffects.push(newEffect);
      }
    }

    // Handle active effects
    const { finalScoreIncrease, updatedEffects } = handleActiveEffects(user.activeEffects, scoreIncrease);

    // Update object
    const updateObj = {
      $inc: { 
        totalScore: Math.round(finalScoreIncrease),
        totalClicks: 1
      },
      $set: { activeEffects: updatedEffects }
    };

    // Add prize if won
    if (prize) {
      updateObj.$push = { 
        prizes: {
          name: prize.name,
          timestamp: new Date()
        }
      };
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { userId },
      updateObj,
      { new: true, upsert: true }
    );

    return {
      totalScore: updatedUser.totalScore,
      totalClicks: updatedUser.totalClicks,
      scoreIncrease,
      prize: prize?.name || null,
      activeEffects: updatedUser.activeEffects
    };
  } catch (error) {
    console.error('Click handling error:', error);
    throw error;
  }
};

export default handleClick;