// config/constants.js
export const PRIZES = [
    { 
      name: 'Golden Cookie', 
      chance: 0.3,
      pointIncrease: 50
    },
    { 
      name: 'Treasure Chest', 
      chance: 0.05,
      pointIncrease: 100
    },
    { 
      name: 'Mega Cookie', 
      chance: 0.05,
      pointIncrease: 500
    }
];
  
export const ACTIVE_EFFECTS = {
    doublePoints: {
      type: 'doublePoints',
      duration: 30000 // 30 seconds
    },
    luckyCharm: {
      type: 'luckyCharm',
      remainingClicks: 5
    },
    prizeMultiplier: {
      type: 'prizeMultiplier',
      multiplier: 1.5,
      remainingClicks: 10
    }
};