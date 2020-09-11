import React from 'react';
import UsingHooks from './UsingHooks';
import UsingClass from './UsingClass';
import './index.css';

function App() {
  return (
    <div className="container">
      <div className="left"><UsingHooks /></div>
      <div className="right"><UsingClass /></div>
    </div>
  );
}

export default App;