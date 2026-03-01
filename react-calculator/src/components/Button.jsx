// Purpose: Reusable calculator button component.
// Inputs: value (string), onClick (function), variant (string), className (string), disabled (boolean).
// Outputs: Renders a button and emits the button value via onClick when clicked.
// Behavior: Stateless presentational component used for all calculator keys with variant styling support.
import React from 'react';

function Button({ value, onClick, variant = 'number', className = '', disabled = false }) {
  const handleClick = () => {
    if (disabled || typeof onClick !== 'function') return;
    onClick(value);
  };

  // Determine variant CSS class
  const variantClass = variant
    ? `calc-btn--${variant}`
    : 'calc-btn--number';

  return (
    <button
      type="button"
      className={`calc-btn ${variantClass} ${className}`.trim()}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Calculator key ${value}`}
    >
      {value}
    </button>
  );
}

export default Button;
