// Purpose: Display current calculator state including expression, result, and error messages.
// Inputs:
//   - expression (string): Current mathematical expression being built (e.g., "2+3*4")
//   - result (string | number): Computed result after evaluation (e.g., 14)
//   - error (string): Error message if evaluation failed (e.g., "Division by zero")
//   - previousResult (string | number): Previous calculation result for history display (optional)
// Outputs: Rendered display panel with expression line and result/error line with proper styling.
// Behavior: Shows expression on first line, result or error on second line. Handles overflow gracefully,
//   provides rich accessibility announcements, formats large numbers, and highlights errors visually.

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

// Helper: Format large numbers for display readability
const formatNumber = (num) => {
  if (typeof num !== 'number' || Number.isNaN(num)) return String(num);

  // Handle scientific notation for very large/small numbers
  if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6);
  }

  // Format with reasonable decimal places
  const str = String(num);
  if (str.includes('.')) {
    // Limit decimal places for readability
    return parseFloat(num.toFixed(10)).toString();
  }

  return str;
};

// Helper: Truncate long expressions for display
const truncateExpression = (expr, maxLength = 25) => {
  if (typeof expr !== 'string') return '';
  if (expr.length <= maxLength) return expr;
  return '...' + expr.slice(-(maxLength - 3));
};

function Display({
  expression = '',
  result = '',
  error = '',
  previousResult = '',
  ariaLive = 'polite',
}) {
  // Sanitize inputs
  const safeExpression = String(expression || '').trim();
  const safeError = String(error || '').trim();
  const displayResult = useMemo(() => {
    if (safeError) return safeError;
    if (result === '' || result === undefined || result === null) return 'Ready';
    if (typeof result === 'number') return formatNumber(result);
    return String(result);
  }, [result, safeError]);

  // Generate accessible announcement
  const accessibleAnnouncement = useMemo(() => {
    if (safeError) return `Error: ${safeError}`;
    if (displayResult && displayResult !== 'Ready') return `Result: ${displayResult}`;
    return `Expression: ${safeExpression || 'Empty'}`;
  }, [safeError, displayResult, safeExpression]);

  // Truncate expression for display to prevent overflow
  const truncatedExpression = useMemo(() => {
    return truncateExpression(safeExpression);
  }, [safeExpression]);

  return (
    <div
      className="calc-display"
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
      aria-label="Calculator display"
    >
      {/* Expression line: shows current input being built */}
      <div className="calc-display__expression" title={safeExpression || 'No input'}>
        {truncatedExpression || '0'}
      </div>

      {/* Result line: shows evaluation result, error, or ready state */}
      <div
        className={`calc-display__result ${safeError ? 'is-error' : ''}`}
        role={safeError ? 'alert' : 'status'}
        aria-label={accessibleAnnouncement}
      >
        {displayResult}
      </div>

      {/* Optional: Show previous result hint if available */}
      {previousResult && !safeError && displayResult === 'Ready' && (
        <div className="calc-display__hint" aria-label={`Previous result: ${previousResult}`}>
          ← {previousResult}
        </div>
      )}

      {/* Invisible aria-live region for dynamic announcements */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {accessibleAnnouncement}
      </div>
    </div>
  );
}

Display.propTypes = {
  expression: PropTypes.string,
  result: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  error: PropTypes.string,
  previousResult: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ariaLive: PropTypes.oneOf(['polite', 'assertive', 'off']),
};

export default Display;
