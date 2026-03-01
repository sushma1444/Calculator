import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders calculator app', () => {
  render(<App />);
  const calculatorElement = screen.getByRole('region', { name: /Calculator/i });
  expect(calculatorElement).toBeInTheDocument();
});
