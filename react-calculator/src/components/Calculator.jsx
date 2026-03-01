// Purpose: Parent calculator container and state manager.
// Inputs: None.
// Outputs: Renders calculator display and keypad layout.
// Behavior: Holds temporary placeholder state for Task 1 and prepares integration points for parser logic.
import React, { useState } from 'react';
import Display from './Display';
import Button from './Button';

const KEYS = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];

function Calculator() {
  const [expression, setExpression] = useState('');

  const handleButtonClick = (value) => {
    if (value === 'C') {
      setExpression('');
      return;
    }

    if (value === '=') {
      return;
    }

    setExpression((prev) => `${prev}${value}`);
  };

  return (
    <section className="calculator" aria-label="Calculator">
      <Display expression={expression} result="" error="" />
      <div className="calculator-grid">
        {KEYS.map((key) => (
          <Button
            key={key}
            value={key}
            onClick={handleButtonClick}
            variant={
              key === 'C' ? 'action' :
              key === '=' ? 'action' :
              ['+', '-', '*', '/'].includes(key) ? 'operator' : 'number'
            }
          />
        ))}
      </div>
    </section>
  );
}

export default Calculator;
