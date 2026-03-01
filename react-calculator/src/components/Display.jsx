// Purpose: Displays current calculator expression and result/error output.
// Inputs: expression (string), result (string | number), error (string).
// Outputs: Renders display text for expression and output line.
// Behavior: Shows error text when present, otherwise shows result or placeholder.
import React from 'react';

function Display({ expression = '', result = '', error = '' }) {
  return (
    <div className="calc-display" role="status" aria-live="polite">
      <div className="calc-display__expression">{expression || '0'}</div>
      <div className={`calc-display__result ${error ? 'is-error' : ''}`}>
        {error || (result !== '' ? String(result) : 'Ready')}
      </div>
    </div>
  );
}

export default Display;
