import React, { useState, useEffect, useRef } from 'react';
import cookieImage from  '../assests/images/cookie.png';

const API_URL = process.env.REACT_APP_API_URL;

const CookieIcon = ({ isPressed, onClick }) => (
  <img
    src={cookieImage}// Adjust this path to where your image is stored
    alt="Cookie"
    onClick={onClick}
    style={{
      // background: url(cookie.png),
      width: '200px',
      height: '200px',
      cursor: 'pointer',
      transform: isPressed ? 'scale(0.9)' : 'scale(1)',
      transition: 'transform 0.1s',
      filter: isPressed ? 'brightness(0.8)' : 'none',
    }}
  />
);

const ClickerGame = () => {
  const [totalScore, setTotalScore] = useState(0);
  const [clickNotification, setClickNotification] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isPressed, setIsPressed] = useState(false);
  const [activeEffects, setActiveEffects] = useState([]);
  const effectTimerRef = useRef(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId || `user_${Date.now()}`);
    localStorage.setItem('userId', storedUserId || `user_${Date.now()}`);
  }, []);

  // Effect tracking and cleanup
  useEffect(() => {
    if (activeEffects.length > 0) {
      if (effectTimerRef.current) {
        clearInterval(effectTimerRef.current);
      }

      effectTimerRef.current = setInterval(() => {
        setActiveEffects(currentEffects => 
          currentEffects.filter(effect => {
            // Time-based effects
            if (effect.remainingTime !== undefined) {
              const newRemainingTime = Math.max(0, effect.remainingTime - 1);
              return newRemainingTime > 0;
            }
            // Click-based effects
            return effect.remainingClicks > 0;
          }).map(effect => {
            if (effect.remainingTime !== undefined) {
              return { ...effect, remainingTime: effect.remainingTime - 1 };
            }
            return effect;
          })
        );
      }, 1000);

      return () => {
        if (effectTimerRef.current) {
          clearInterval(effectTimerRef.current);
        }
      };
    }
  }, [activeEffects]);

  // Calculate current click value based on active effects
  const calculateClickValue = (baseValue) => {
    return activeEffects.reduce((finalValue, effect) => {
      switch(effect.type) {
        case 'Double Points':
          if (Date.now() - effect.startTime < effect.duration) {
            return finalValue * 2;
          }
          return finalValue;
        
        case 'Prize Multiplier':
          if (effect.remainingClicks > 0) {
            return finalValue * 1.5;
          }
          return finalValue;
        
        case 'Lucky Charm':
          if (effect.remainingClicks > 0) {
            return finalValue + 10;
          }
          return finalValue;
        
        default:
          return finalValue;
      }
    }, baseValue);
  };

  const handleClick = async () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);

    try {
      const response = await fetch(`${API_URL}/api/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          activeEffects: activeEffects
        })
      });
      
      const { 
        totalScore, 
        scoreIncrease, 
        prize, 
        prizeEffect,
        updatedActiveEffects 
      } = await response.json();
      
      setTotalScore(totalScore);
      
      const notifications = [];
      
      // Calculate modified click value
      const modifiedScoreIncrease = calculateClickValue(scoreIncrease);
      
      // Base click notification
      notifications.push({
        value: modifiedScoreIncrease,
        id: Date.now(),
        x: -20,
        y: Math.random() * 20 - 10
      });
      
      // Prize notification if exists
      if (prize && prizeEffect) {
        notifications.push({
          value: prizeEffect.pointIncrease,
          prize: prize,
          id: Date.now() + 1,
          x: 20,
          y: Math.random() * 20 - 10
        });
        
        // Add new prize to list
        setPrizes(prev => [{
          name: prize,
          timestamp: new Date().toLocaleString()
        }, ...prev]);
      }
      
      // Update active effects
      setActiveEffects(updatedActiveEffects || []);
      
      setClickNotification(notifications);
      
      setTimeout(() => setClickNotification(null), 1000);
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
        
        {/* Active Effects Display */}
        {activeEffects.map((effect, index) => (
          <div 
            key={index} 
            style={{ 
              color: 'green', 
              marginBottom: '10px', 
              fontWeight: 'bold' 
            }}
          >
            {effect.type} 
            {effect.remainingTime !== undefined 
              ? ` ends in: ${effect.remainingTime} seconds`
              : ` remaining: ${effect.remainingClicks} clicks`
            }
          </div>
        ))}
        
        <div style={{ position: 'relative' }}>
          <CookieIcon 
            isPressed={isPressed}
            onClick={handleClick} 
          />

          {clickNotification && clickNotification
            .filter(notification => notification.value > 0)
            .map(notification => (
              <div key={notification.id} style={{
                position: 'absolute',
                top: notification.prize ? '20%' : '60%', 
                left: notification.prize ? '50%' : '50%',
                transform: `translate(${notification.x}px, ${notification.y}px)`,
                color: notification.prize ? 'brown' : 'white',
                opacity: 0,
                animation: 'fadeOut 3s forwards',
                fontSize: '24px',
                textAlign: 'center',
                fontWeight: notification.prize ? 'bold' : 'normal'
              }}>
                {notification.prize ? `🎉+${notification.value}` : `+${notification.value}`}
              </div>
            ))
          }
        </div>
      </div>

      {/* Prize List */}
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
            {prize.name}
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
          0% { opacity: 1; transform: translate(0, 0); }
          100% { opacity: 0; transform: translate(var(--x), var(--y)); }
        }
      `}</style>
    </div>
  );
};

export default ClickerGame;