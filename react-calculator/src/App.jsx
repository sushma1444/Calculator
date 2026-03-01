// Purpose: Root application component.
// Inputs: None.
// Outputs: Renders the calculator application shell.
// Behavior: Composes top-level layout and mounts the Calculator component.
import React from 'react';
import Calculator from './components/Calculator';
import './styles/calculator.css';

function App() {
  return (
    <main className="app-shell">
      <Calculator />
    </main>
  );
}

export default App;
