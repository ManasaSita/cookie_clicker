import User from '../models/UserSchema.js';

const PRIZES = [
  { 
    name: 'Golden Cookie', 
    effect: (user) => ({ 
      pointIncrease: 50,
      activeEffects: [] 
    })
  },
  { 
    name: 'Double Points Boost', 
    effect: (user) => ({ 
      pointIncrease: 0,
      activeEffects: [{
        type: 'doublePoints',
        duration: 30000, // 30 seconds
        startTime: Date.now()
      }]
    })
  },
  { 
    name: 'Treasure Chest', 
    effect: (user) => ({ 
      pointIncrease: 100,
      activeEffects: [] 
    })
  },
  { 
    name: 'Lucky Charm', 
    effect: (user) => ({ 
      pointIncrease: 0,
      activeEffects: [{
        type: 'luckyCharm',
        remainingClicks: 5
      }]
    })
  },
  { 
    name: 'Prize Multiplier', 
    effect: (user) => ({ 
      pointIncrease: 0,
      activeEffects: [{
        type: 'prizeMultiplier',
        multiplier: 1.5,
        remainingClicks: 10
      }]
    })
  },
  { 
    name: 'Mega Cookie', 
    effect: (user) => ({ 
      pointIncrease: 500,
      activeEffects: [] 
    })
  }
];

const handleClick = async (userId) => {
  try {
    const randomValue = Math.random();
    let scoreIncrease = 1;
    let prize = null;
    let prizeEffect = null;

    // 50% chance of 10 points
    if (randomValue < 0.5) {
      scoreIncrease = 10;
    }

    // Prize logic with varied probabilities
    const prizeChance = Math.random();
    if (prizeChance < 0.25) {
      const weightedPrizes = [
        { name: 'Golden Cookie', chance: 0.3 },
        { name: 'Double Points Boost', chance: 0.2 },
        { name: 'Treasure Chest', chance: 0.05 },
        { name: 'Lucky Charm', chance: 0.2 },
        { name: 'Prize Multiplier', chance: 0.2 },
        { name: 'Mega Cookie', chance: 0.05 }
      ];

      const selectedPrize = weightedPrizes
        .find(p => Math.random() < p.chance);

      if (selectedPrize) {
        prize = selectedPrize.name;
        prizeEffect = PRIZES.find(p => p.name === prize);
      }
    }

    // Update user
    const user = await User.findOneAndUpdate(
      { userId },
      {
        $inc: { 
          totalScore: scoreIncrease + (prizeEffect ? prizeEffect.effect(null).pointIncrease : 0)
        },
        $push: { 
          prizes: prize ? {
            name: prize,
            timestamp: new Date()
          } : null 
        }
      },
      { new: true, upsert: true }
    );

    return {
      totalScore: user.totalScore,
      scoreIncrease,
      prize,
      prizeEffect: prizeEffect ? prizeEffect.effect(user) : null
    };
  } catch (error) {
    console.error('Click handling error:', error);
    throw error;
  }
};

export default handleClick;