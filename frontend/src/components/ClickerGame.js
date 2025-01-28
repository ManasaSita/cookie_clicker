// src/components/ClickerGame.js
import React, { useState, useEffect } from 'react';
import cookieImage from '../assests/images/cookie.png';

const API_URL = 'http://localhost:5000';

const CookieIcon = ({ isPressed, onClick }) => (
  <img
    src={cookieImage}
    alt="Cookie"
    onClick={onClick}
    style={{
      width: '400px',
      height: '400px',
      cursor: 'pointer',
      transform: isPressed ? 'scale(0.9)' : 'scale(1)',
      transition: 'transform 0.1s',
      filter: isPressed ? 'brightness(0.8)' : 'none',
    }}
  />
);

const formatEffectName = (effectType) => {
  // Convert camelCase to Title Case with spaces
  return effectType
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

const EffectDisplay = ({ effect, timer }) => (
  <div style={{
    backgroundColor: '#f8f9fa',
    padding: '8px 16px',
    borderRadius: '6px',
    margin: '4px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif'
  }}>
    <span style={{
      color: '#2c5282',
      fontWeight: 'bold',
      fontSize: '18px',
      letterSpacing: '0.5px'
    }}>
      {formatEffectName(effect.type)} Active!
    </span>
  </div>
);


const ClickerGame = () => {
  const [totalScore, setTotalScore] = useState(0);
  const [clickNotifications, setClickNotifications] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isPressed, setIsPressed] = useState(false);
  const [activeEffects, setActiveEffects] = useState([]);
  const [effectTimers, setEffectTimers] = useState({});

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const newUserId = storedUserId || `user_${Date.now()}`;
    setUserId(newUserId);
    localStorage.setItem('userId', newUserId);
  }, []);

  // Handle duration-based effects
  useEffect(() => {
    const timers = {};
    
    activeEffects.forEach(effect => {
      if (effect.duration) {
        const startTime = effect.startTime;
        const duration = effect.duration;
        const endTime = startTime + duration;

        const timer = setInterval(() => {
          const now = Date.now();
          const remaining = Math.ceil((endTime - now) / 1000);

          if (remaining <= 0) {
            setActiveEffects(prev => prev.filter(e => e.type !== effect.type));
            clearInterval(timer);
          } else {
            setEffectTimers(prev => ({
              ...prev,
              [effect.type]: remaining
            }));
          }
        }, 1000);

        timers[effect.type] = timer;
      }
    });

    return () => {
      Object.values(timers).forEach(timer => clearInterval(timer));
    };
  }, [activeEffects]);

  const handleClick = async () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);

    try {
      const response = await fetch(`${API_URL}/api/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const { totalScore, scoreIncrease, prize, activeEffects: newEffects } = await response.json();
      
      setTotalScore(totalScore);
      
      const notifications = [];
      
      // Base score notification
      notifications.push({
        value: scoreIncrease,
        type: 'base',
        id: Date.now(),
        x: Math.random() * 40 - 20,
        y: Math.random() * 20 - 10
      });

      // Effect bonus notifications
      newEffects?.forEach(effect => {
        if (effect.type === 'doublePoints') {
          notifications.push({
            value: scoreIncrease,
            type: 'effect',
            effectName: 'Double',
            id: Date.now() + 1,
            x: Math.random() * 40 - 20,
            y: Math.random() * 20 - 10
          });
        } else if (effect.type === 'luckyCharm') {
          notifications.push({
            value: 10,
            type: 'effect',
            effectName: 'Lucky',
            id: Date.now() + 2,
            x: Math.random() * 40 - 20,
            y: Math.random() * 20 - 10
          });
        } else if (effect.type === 'prizeMultiplier') {
          notifications.push({
            value: scoreIncrease * (effect.multiplier - 1),
            type: 'effect',
            effectName: 'Multiplier',
            id: Date.now() + 3,
            x: Math.random() * 40 - 20,
            y: Math.random() * 20 - 10
          });
        }
      });
      
      // Prize notification
      if (prize) {
        notifications.push({
          value: scoreIncrease,
          prize: prize,
          id: Date.now() + 4,
          x: Math.random() * 40 - 20,
          y: Math.random() * 20 - 10
        });
        
        setPrizes(prev => [{
          name: prize,
          timestamp: new Date().toLocaleString()
        }, ...prev]);
      }

      setActiveEffects(newEffects || []);
      setClickNotifications(notifications);
      setTimeout(() => setClickNotifications([]), 1000);
    } catch (error) {
      console.error('Click failed', error);
    }
  };

  const removePrize = (indexToRemove) => {
    setPrizes(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearAllPrizes = () => {
    setPrizes([]);
  };

  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      height: '100vh',
      backgroundColor: '#f0f0f0'
    }}>
      <div style={{ 
        width: '50%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <h2>{totalScore} cookies</h2>
        
        {activeEffects.length > 0 && (
          <div style={{
            color: 'green',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            {activeEffects.map(effect => (
              <EffectDisplay 
                key={effect.type} 
                effect={effect}
                timer={effectTimers[effect.type]}
              />
            ))}
          </div>
        )}
        
        <div style={{ position: 'relative' }}>
          <CookieIcon 
            isPressed={isPressed}
            onClick={handleClick} 
          />
          
          {clickNotifications.map((notification) => (
            <div key={notification.id} style={{
              position: 'absolute',
              top: notification.prize || notification.type === 'effect' ? '50%' : '60%',
              left: notification.prize || notification.type === 'effect' ? '50%' : '40%',
              transform: `translate(${notification.x}px, ${notification.y}px)`,
              color: notification.prize ? 'brown' : 
                     notification.type === 'effect' ? '#4CAF50' : 'white',
              opacity: 0,
              animation: 'fadeOut 5s forwards',
              fontSize: '24px',
              textAlign: 'center',
              fontWeight: notification.prize || notification.type === 'effect' ? 'bold' : 'normal'
            }}>
              {notification.prize 
                ? `🎉+${notification.value}`
                : notification.type === 'effect'
                  ? `+${notification.value}`
                  : `+${notification.value}`
              }
            </div>
          ))}
        </div>
        
        {activeEffects.map(effect => (
          <div key={effect.type} style={{
            marginTop: '10px',
            fontSize: '18px',
            color: 'blue'
          }}>
            {effect.duration 
              ? `${formatEffectName(effect.type)} ends in: ${effectTimers[effect.type] || 0} seconds`
              : `${formatEffectName(effect.type)} remaining: ${effect.remainingClicks} clicks`
            }
          </div>
        ))}
      </div>

      <div style={{ 
        width: '50%', 
        backgroundColor: '#e0e0e0', 
        padding: '20px', 
        overflowY: 'auto' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <h2>Prizes Won</h2>
          <button 
            onClick={clearAllPrizes}
            style={{
              backgroundColor: 'red',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px'
            }}
          >
            Clear All
          </button>
        </div>
        {prizes.map((prize, index) => (
          <div 
            key={index} 
            style={{
              backgroundColor: 'white',
              margin: '10px 0',
              padding: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderRadius: '5px'
            }}
          >
            <div>
              <span style={{ fontWeight: 'bold' }}>{prize.name}</span>
            </div>
            <button 
              onClick={() => removePrize(index)}
              style={{
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '25px',
                height: '25px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; transform: translate(-50%, -50%); }
          100% { opacity: 0; transform: translate(-50%, -100%); }
        }
      `}</style>
    </div>
  );
};

export default ClickerGame;