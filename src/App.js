import React from 'react';
import './App.css';
import RealTimeComponent from './RealTimeComponent'; // Import your component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <RealTimeComponent /> {/* Render the real-time component */}
      </header>
    </div>
  );
}

export default App;
