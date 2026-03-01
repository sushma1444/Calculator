// Purpose: Reusable calculator button component for keypad input.
// Inputs:
//   - value (string): Button display text and emitted value on click
//   - onClick (function): Callback fired with button value when clicked
//   - variant (string): Button style variant — 'number', 'operator', 'action' (default: 'number')
//   - className (string): Additional CSS classes for custom styling
//   - disabled (boolean): Disable button interaction and apply disabled styles (default: false)
//   - title (string): Tooltip text displayed on hover (optional)
// Outputs: Rendered <button> element with appropriate styling and event listeners.
// Behavior: Stateless presentational component. Validates inputs, applies variant CSS classes,
//   handles click safely, and provides rich accessibility attributes for screen readers and keyboard navigation.

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

// Valid button variants with semantic descriptions
const VARIANT_MAP = {
  number: 'calc-btn--number',    // Digits and decimal point
  operator: 'calc-btn--operator', // Arithmetic operators (+, -, *, /)
  action: 'calc-btn--action',     // Action buttons (C, =, etc.)
};

function Button({
  value = '',
  onClick = null,
  variant = 'number',
  className = '',
  disabled = false,
  title = '',
  'aria-label': ariaLabel = '',
  'aria-pressed': ariaPressed = undefined,
}) {
  // Validate and sanitize variant
  const validVariant = VARIANT_MAP[variant] || VARIANT_MAP.number;

  // Build accessible label if not provided
  const accessibleLabel = useMemo(() => {
    if (ariaLabel) return ariaLabel;
    
    // Auto-generate label based on value and variant
    const variantHint = {
      number: 'digit',
      operator: 'operator',
      action: 'action',
    }[variant];

    return `${variantHint} ${value}`.trim();
  }, [ariaLabel, value, variant]);

  // Safe click handler with validation
  const handleClick = (e) => {
    e.preventDefault();
    
    // Validate before firing callback
    if (disabled || !onClick || typeof onClick !== 'function') {
      return;
    }

    onClick(value);
  };

  // Compose class names efficiently
  const buttonClasses = useMemo(() => {
    const classes = ['calc-btn', validVariant];
    
    if (className) {
      classes.push(className);
    }

    return classes.join(' ');
  }, [validVariant, className]);

  return (
    <button
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      onKeyDown={(e) => {
        // Support Enter and Space for keyboard navigation
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick(e);
        }
      }}
      disabled={disabled}
      title={title || `Click to input ${value}`}
      aria-label={accessibleLabel}
      aria-pressed={ariaPressed}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      {value}
    </button>
  );
}

Button.propTypes = {
  value: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['number', 'operator', 'action']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  title: PropTypes.string,
  'aria-label': PropTypes.string,
  'aria-pressed': PropTypes.bool,
};

export default Button;
