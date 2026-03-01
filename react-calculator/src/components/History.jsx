// Purpose: Display recent calculation history for user reference.
// Inputs:
//   - history (array): Array of calculation objects with { expression, result, timestamp }
//   - onHistoryClick (function): Optional callback when user clicks a history item
//   - maxItems (number): Maximum number of history items to display (default: 5)
// Outputs: Renders a scrollable list of previous calculations.
// Behavior: Shows last N calculations in reverse chronological order (newest first).
//   Allows user to click items to restore expression (if onHistoryClick provided).

import React from 'react';
import PropTypes from 'prop-types';

function History({ history = [], onHistoryClick = null, maxItems = 5 }) {
  // Limit to maxItems, newest first
  const displayHistory = history.slice(0, maxItems);

  // Handle click on history item
  const handleItemClick = (item) => {
    if (typeof onHistoryClick === 'function') {
      onHistoryClick(item);
    }
  };

  // Empty state
  if (displayHistory.length === 0) {
    return (
      <aside className="calc-history" aria-label="Calculation history">
        <h3 className="calc-history__title">History</h3>
        <p className="calc-history__empty">No calculations yet</p>
      </aside>
    );
  }

  return (
    <aside className="calc-history" aria-label="Calculation history">
      <h3 className="calc-history__title">History</h3>
      <ul className="calc-history__list">
        {displayHistory.map((item, index) => (
          <li
            key={item.timestamp || index}
            className={`calc-history__item ${onHistoryClick ? 'calc-history__item--clickable' : ''}`}
            onClick={() => handleItemClick(item)}
            role={onHistoryClick ? 'button' : 'listitem'}
            tabIndex={onHistoryClick ? 0 : -1}
            onKeyDown={(e) => {
              if (onHistoryClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleItemClick(item);
              }
            }}
            aria-label={`Calculation: ${item.expression} equals ${item.result}`}
            title={onHistoryClick ? 'Click to reuse this calculation' : ''}
          >
            <div className="calc-history__expression">{item.expression}</div>
            <div className="calc-history__result">= {item.result}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

History.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      expression: PropTypes.string.isRequired,
      result: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      timestamp: PropTypes.number,
    })
  ),
  onHistoryClick: PropTypes.func,
  maxItems: PropTypes.number,
};

export default History;
