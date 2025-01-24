import React from 'react';
import ClickerGame from './components/ClickerGame';

function App() {
  return (
    <div className="App" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <ClickerGame />
    </div>
  );
}

export default App;