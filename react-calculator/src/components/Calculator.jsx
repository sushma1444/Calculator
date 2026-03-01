// Purpose: Calculator container managing state, input validation, and button logic.
// Inputs: None (uses internal state via React hooks).
// Outputs: Renders Display and Button components with complete calculator UI.
// Behavior: Manages expression state, validates operator stacking, prevents decimal duplicates,
//   handles clear/equals operations, and passes validated input to display. Prepares for parser integration.

import React, { useState, useCallback } from 'react';
import Display from './Display';
import Button from './Button';

// Define valid operators and number buttons for validation
const OPERATORS = ['+', '-', '*', '/'];
const DECIMAL_POINT = '.';
const CLEAR_BUTTON = 'C';
const EQUALS_BUTTON = '=';

// Button layout: 4 columns × 4.25 rows
const KEYS = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+', 'C'];

// Helper: Check if character is an operator
const isOperator = (char) => OPERATORS.includes(char);

// Helper: Get last token from expression (operand or operator)
const getLastToken = (expr) => {
  if (!expr) return '';
  const tokens = expr.match(/\d+\.?\d*|[+\-*/]/g) || [];
  return tokens[tokens.length - 1] || '';
};

// Helper: Check if expression ends with an operator
const endsWithOperator = (expr) => {
  if (!expr) return false;
  const lastChar = expr.trim().slice(-1);
  return isOperator(lastChar);
};

// Helper: Check if last number has decimal point
const lastNumberHasDecimal = (expr) => {
  const lastToken = getLastToken(expr);
  return lastToken.includes(DECIMAL_POINT) || false;
};

// Helper: Validate if we can add operator (prevent ++, --, etc.)
const canAddOperator = (expr) => {
  if (!expr) return false;
  // Can add operator if expression doesn't end with operator
  return !endsWithOperator(expr);
};

function Calculator() {
  const [expression, setExpression] = useState('');
  const [previousResult, setPreviousResult] = useState('');
  const [error, setError] = useState('');

  // Safe handler for all button clicks with input validation
  const handleButtonClick = useCallback(
    (value) => {
      // Clear error on any new input (gives user chance to recover)
      const shouldClearError = value !== CLEAR_BUTTON && error;

      // Handle CLEAR button
      if (value === CLEAR_BUTTON) {
        setExpression('');
        setPreviousResult('');
        setError('');
        return;
      }

      // Handle EQUALS button - placeholder for parser integration (Task 8)
      if (value === EQUALS_BUTTON) {
        if (!expression) {
          setError('No expression to evaluate');
          return;
        }

        if (endsWithOperator(expression)) {
          setError('Invalid expression: ends with operator');
          return;
        }

        // Placeholder: Parser integration happens in Task 8-9
        // For now, show that equals was pressed
        try {
          // TODO: Integrate evaluateExpression(expression) from parser
          // const result = evaluateExpression(expression);
          // setPreviousResult(expression);
          // setExpression('');
          // setError('');
          
          // Temporary placeholder behavior
          setError('Parser not yet integrated (Task 8-9)');
        } catch (err) {
          setError(err.message || 'Calculation error');
        }
        return;
      }

      // Handle OPERATOR input
      if (isOperator(value)) {
        // Prevent operator stacking: can't add operator if last char is operator
        if (!canAddOperator(expression)) {
          // Replace last operator if user clicks different operator quickly
          const trimmed = expression.trim();
          const lastChar = trimmed.slice(-1);
          if (isOperator(lastChar)) {
            setExpression(trimmed.slice(0, -1) + value);
            shouldClearError && setError('');
            return;
          }

          setError('Invalid operator placement');
          return;
        }

        setExpression((prev) => `${prev}${value}`);
        shouldClearError && setError('');
        return;
      }

      // Handle DECIMAL input
      if (value === DECIMAL_POINT) {
        // Prevent multiple decimals in one number
        if (lastNumberHasDecimal(expression)) {
          setError('Decimal point already entered');
          return;
        }

        // If expression is empty or ends with operator, prepend '0'
        if (!expression || endsWithOperator(expression)) {
          setExpression((prev) => `${prev}0${DECIMAL_POINT}`);
          shouldClearError && setError('');
          return;
        }

        setExpression((prev) => `${prev}${value}`);
        shouldClearError && setError('');
        return;
      }

      // Handle NUMBER input (digits 0-9)
      if (/^\d$/.test(value)) {
        // Limit expression length to prevent UI overflow
        if (expression.length >= 50) {
          setError('Expression too long');
          return;
        }

        setExpression((prev) => `${prev}${value}`);
        shouldClearError && setError('');
        return;
      }

      // Unknown button (safety fallback)
      console.warn(`Unknown button value: ${value}`);
    },
    [expression, error]
  );

  // Determine variant for each button
  const getButtonVariant = (key) => {
    if (key === CLEAR_BUTTON || key === EQUALS_BUTTON) return 'action';
    if (isOperator(key)) return 'operator';
    return 'number';
  };

  return (
    <section className="calculator" aria-label="Calculator">
      <Display
        expression={expression}
        result=""
        error={error}
        previousResult={previousResult}
      />
      <div className="calculator-grid">
        {KEYS.map((key) => (
          <Button
            key={key}
            value={key}
            onClick={handleButtonClick}
            variant={getButtonVariant(key)}
            disabled={false}
            title={
              key === CLEAR_BUTTON ? 'Clear calculator' :
              key === EQUALS_BUTTON ? 'Evaluate expression' :
              `Input ${key}`
            }
          />
        ))}
      </div>
    </section>
  );
}

export default Calculator;
