// Purpose: Component rendering tests for Calculator (Task 12)
// Tests calculator UI elements, button presence, and basic interactions

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Calculator from '../Calculator';

describe('Calculator Component - Rendering', () => {
  test('should render calculator component', () => {
    render(<Calculator />);
    const calculatorElement = screen.getByRole('region', { name: /Calculator/i });
    expect(calculatorElement).toBeInTheDocument();
  });

  test('should render display component', () => {
    render(<Calculator />);
    // Display should show initial state
    const displayStatus = screen.getByRole('status', { name: /Calculator display/i });
    expect(displayStatus).toBeInTheDocument();
  });

  test('should render History component', () => {
    render(<Calculator />);
    const historyTitle = screen.getByText('History');
    expect(historyTitle).toBeInTheDocument();
  });
});

describe('Calculator Component - Key Controls', () => {
  test('should render clear button (C)', () => {
    render(<Calculator />);
    const clearButton = screen.getByRole('button', { name: /action C/i });
    expect(clearButton).toBeInTheDocument();
  });

  test('should render equals button (=)', () => {
    render(<Calculator />);
    const equalsButton = screen.getByRole('button', { name: /action =/i });
    expect(equalsButton).toBeInTheDocument();
  });

  test('should render all digit buttons (0-9)', () => {
    render(<Calculator />);
    for (let i = 0; i <= 9; i++) {
      const digitButton = screen.getByRole('button', { name: new RegExp(`digit ${i}`) });
      expect(digitButton).toBeInTheDocument();
    }
  });

  test('should render all operator buttons (+, -, *, /)', () => {
    render(<Calculator />);
    const operators = [
      { symbol: '+', label: 'operator +' },
      { symbol: '-', label: 'operator -' },
      { symbol: '*', label: 'operator *' },
      { symbol: '/', label: 'operator /' },
    ];
    
    operators.forEach(({ label }) => {
      const operatorButton = screen.getByRole('button', { name: label });
      expect(operatorButton).toBeInTheDocument();
    });
  });

  test('should render decimal point button (.)', () => {
    render(<Calculator />);
    const decimalButton = screen.getByRole('button', { name: /digit \./i });
    expect(decimalButton).toBeInTheDocument();
  });
});

describe('Calculator Component - Basic Interactions', () => {
  test('should update display when number button is clicked', () => {
    render(<Calculator />);
    
    // Click number 5
    const button5 = screen.getByRole('button', { name: 'digit 5' });
    fireEvent.click(button5);
    
    // Display should show 5 in expression
    const expressionDisplay = screen.getByRole('status', { name: /Calculator display/i });
    expect(expressionDisplay).toHaveTextContent('5');
  });

  test('should append multiple digits', () => {
    render(<Calculator />);
    
    // Click 1, 2, 3
    fireEvent.click(screen.getByRole('button', { name: 'digit 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 3' }));
    
    // Display should show 123
    const expressionDisplay = screen.getByRole('status', { name: /Calculator display/i });
    expect(expressionDisplay).toHaveTextContent('123');
  });

  test('should clear display when C button is clicked', () => {
    render(<Calculator />);
    
    // Enter some numbers
    fireEvent.click(screen.getByRole('button', { name: 'digit 5' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 6' }));
    
    // Click clear
    const clearButton = screen.getByRole('button', { name: 'action C' });
    fireEvent.click(clearButton);
    
    // Display should show 0
    const expressionDisplay = screen.getByRole('status', { name: /Calculator display/i });
    expect(expressionDisplay).toHaveTextContent('0');
  });

  test('should handle operator input', () => {
    render(<Calculator />);
    
    // Click 5 + 3
    fireEvent.click(screen.getByRole('button', { name: 'digit 5' }));
    fireEvent.click(screen.getByRole('button', { name: 'operator +' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 3' }));
    
    // Display should show the expression
    const expressionDisplay = screen.getByRole('status', { name: /Calculator display/i });
    expect(expressionDisplay).toHaveTextContent('5+3');
  });

  test('should evaluate expression when = button is clicked', () => {
    render(<Calculator />);
    
    // Click 2 + 3 =
    fireEvent.click(screen.getByRole('button', { name: 'digit 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'operator +' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'action =' }));
    
    // Result should show 5
    const resultDisplay = screen.getByRole('status', { name: /Result: 5/i });
    expect(resultDisplay).toBeInTheDocument();
  });

  test('should handle precedence: 2+3*4 = 14', () => {
    render(<Calculator />);
    
    // Click 2 + 3 * 4 =
    fireEvent.click(screen.getByRole('button', { name: 'digit 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'operator +' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'operator *' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'action =' }));
    
    // Result should show 14
    const resultDisplay = screen.getByRole('status', { name: /Result: 14/i });
    expect(resultDisplay).toBeInTheDocument();
  });

  test('should handle decimal input', () => {
    render(<Calculator />);
    
    // Click 3 . 5
    fireEvent.click(screen.getByRole('button', { name: 'digit 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit .' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 5' }));
    
    // Display should show 3.5
    const expressionDisplay = screen.getByRole('status', { name: /Calculator display/i });
    expect(expressionDisplay).toHaveTextContent('3.5');
  });

  test('should handle division by zero gracefully', () => {
    render(<Calculator />);
    
    // Click 5 / 0 =
    fireEvent.click(screen.getByRole('button', { name: 'digit 5' }));
    fireEvent.click(screen.getByRole('button', { name: 'operator /' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 0' }));
    fireEvent.click(screen.getByRole('button', { name: 'action =' }));
    
    // Should show error in the display
    const displayStatus = screen.getByRole('status', { name: /Calculator display/i });
    expect(displayStatus).toHaveTextContent(/Division by zero|Error/i);
  });
});

describe('Calculator Component - History Integration', () => {
  test('should add calculation to history after successful evaluation', () => {
    render(<Calculator />);
    
    // Perform calculation: 2 + 3 = 5
    fireEvent.click(screen.getByRole('button', { name: 'digit 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'operator +' }));
    fireEvent.click(screen.getByRole('button', { name: 'digit 3' }));
    fireEvent.click(screen.getByRole('button', { name: 'action =' }));
    
    // History should show the calculation
    const historyExpression = screen.getByText('2+3');
    expect(historyExpression).toBeInTheDocument();
  });

  test('should display "No calculations yet" when history is empty', () => {
    render(<Calculator />);
    
    // Check for empty state message
    const emptyMessage = screen.getByText('No calculations yet');
    expect(emptyMessage).toBeInTheDocument();
  });
});
