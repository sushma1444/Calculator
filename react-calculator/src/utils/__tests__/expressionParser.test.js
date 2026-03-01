// Unit tests for expressionParser tokenizer (Task 6)
// Run with: npm test -- expressionParser.test.js

import { tokenize, validateTokens, TOKEN_TYPES, infixToPostfix, evaluatePostfix, evaluateExpression } from '../expressionParser';

describe('Tokenizer (Task 6)', () => {
  describe('tokenize() - basic numbers', () => {
    test('should tokenize single digit', () => {
      const tokens = tokenize('5');
      expect(tokens[0].type).toBe(TOKEN_TYPES.NUMBER);
      expect(tokens[0].value).toBe(5);
    });

    test('should tokenize multi-digit number', () => {
      const tokens = tokenize('123');
      expect(tokens[0].type).toBe(TOKEN_TYPES.NUMBER);
      expect(tokens[0].value).toBe(123);
    });

    test('should tokenize decimal number', () => {
      const tokens = tokenize('3.14');
      expect(tokens[0].type).toBe(TOKEN_TYPES.NUMBER);
      expect(tokens[0].value).toBe(3.14);
    });

    test('should tokenize zero-prefixed number', () => {
      const tokens = tokenize('007');
      expect(tokens[0].value).toBe(7);
    });
  });

  describe('tokenize() - operators', () => {
    test('should tokenize addition operator', () => {
      const tokens = tokenize('2+3');
      expect(tokens[0].type).toBe(TOKEN_TYPES.NUMBER);
      expect(tokens[1].type).toBe(TOKEN_TYPES.OPERATOR);
      expect(tokens[1].value).toBe('+');
      expect(tokens[2].type).toBe(TOKEN_TYPES.NUMBER);
    });

    test('should tokenize all operators', () => {
      const operators = ['+', '-', '*', '/'];
      operators.forEach((op) => {
        const tokens = tokenize(`5${op}3`);
        expect(tokens[1].type).toBe(TOKEN_TYPES.OPERATOR);
        expect(tokens[1].value).toBe(op);
      });
    });
  });

  describe('tokenize() - parentheses', () => {
    test('should tokenize parenthesized expression', () => {
      const tokens = tokenize('(2+3)');
      expect(tokens[0].type).toBe(TOKEN_TYPES.LPAREN);
      expect(tokens[1].type).toBe(TOKEN_TYPES.NUMBER);
      expect(tokens[4].type).toBe(TOKEN_TYPES.RPAREN);
    });

    test('should tokenize nested parentheses', () => {
      const tokens = tokenize('((2+3)*4)');
      const parenCount = tokens.filter((t) => t.type === TOKEN_TYPES.LPAREN).length;
      expect(parenCount).toBe(2);
    });
  });

  describe('tokenize() - whitespace handling', () => {
    test('should ignore whitespace', () => {
      const tokens1 = tokenize('2 + 3');
      const tokens2 = tokenize('2+3');
      expect(tokens1.length).toBe(tokens2.length);
      expect(tokens1[1].value).toBe(tokens2[1].value);
    });

    test('should handle leading/trailing whitespace', () => {
      const tokens = tokenize('  2 + 3  ');
      expect(tokens[0].type).toBe(TOKEN_TYPES.NUMBER);
      expect(tokens[0].value).toBe(2);
    });
  });

  describe('tokenize() - complex expressions', () => {
    test('should tokenize precedence expression', () => {
      const tokens = tokenize('2+3*4');
      expect(tokens.length).toBe(6); // 2, +, 3, *, 4, EOF
      expect(tokens[2].value).toBe(3);
      expect(tokens[3].value).toBe('*');
    });

    test('should tokenize expression with decimals and operators', () => {
      const tokens = tokenize('3.5 * 2.1 + 1');
      expect(tokens[0].value).toBe(3.5);
      expect(tokens[2].value).toBe(2.1);
      expect(tokens[4].value).toBe(1);
    });
  });

  describe('tokenize() - error cases', () => {
    test('should reject empty string', () => {
      expect(() => tokenize('')).toThrow('Expression cannot be empty');
    });

    test('should reject invalid characters', () => {
      expect(() => tokenize('2 & 3')).toThrow('Invalid character');
    });

    test('should reject trailing decimal', () => {
      expect(() => tokenize('2.')).toThrow('Invalid number format');
    });

    test('should reject standalone decimal', () => {
      expect(() => tokenize('.')).toThrow('Invalid character');
    });

    test('should reject non-string input', () => {
      expect(() => tokenize(123)).toThrow('Expression must be a string');
    });
  });

  describe('validateTokens() - parenthesis matching', () => {
    test('should accept balanced parentheses', () => {
      const tokens = tokenize('(2+3)');
      expect(() => validateTokens(tokens)).not.toThrow();
    });

    test('should reject unclosed parenthesis', () => {
      const tokens = tokenize('(2+3');
      expect(() => validateTokens(tokens)).toThrow('Mismatched parentheses');
    });

    test('should reject extra closing parenthesis', () => {
      const tokens = tokenize('2+3)');
      expect(() => validateTokens(tokens)).toThrow('Unexpected closing parenthesis');
    });
  });

  describe('validateTokens() - operator placement', () => {
    test('should reject consecutive operators', () => {
      const tokens = tokenize('2++3');
      expect(() => validateTokens(tokens)).toThrow('Consecutive operators');
    });

    test('should reject leading operator', () => {
      const tokens = tokenize('+2');
      expect(() => validateTokens(tokens)).toThrow('cannot start with operator');
    });

    test('should reject trailing operator', () => {
      const tokens = tokenize('2+');
      expect(() => validateTokens(tokens)).toThrow('cannot end with operator');
    });
  });

  describe('infixToPostfix() - basic operations', () => {
    test('should convert simple addition', () => {
      const tokens = tokenize('2+3');
      const postfix = infixToPostfix(tokens);
      expect(postfix.length).toBe(3);
      expect(postfix[0].value).toBe(2);
      expect(postfix[1].value).toBe(3);
      expect(postfix[2].value).toBe('+');
    });

    test('should convert simple subtraction', () => {
      const tokens = tokenize('5-2');
      const postfix = infixToPostfix(tokens);
      expect(postfix[0].value).toBe(5);
      expect(postfix[1].value).toBe(2);
      expect(postfix[2].value).toBe('-');
    });

    test('should convert simple multiplication', () => {
      const tokens = tokenize('3*4');
      const postfix = infixToPostfix(tokens);
      expect(postfix[2].value).toBe('*');
    });

    test('should convert simple division', () => {
      const tokens = tokenize('8/2');
      const postfix = infixToPostfix(tokens);
      expect(postfix[2].value).toBe('/');
    });
  });

  describe('infixToPostfix() - operator precedence', () => {
    test('should respect precedence: 2+3*4 → 2 3 4 * +', () => {
      const tokens = tokenize('2+3*4');
      const postfix = infixToPostfix(tokens);
      expect(postfix.length).toBe(5);
      expect(postfix[0].value).toBe(2);
      expect(postfix[1].value).toBe(3);
      expect(postfix[2].value).toBe(4);
      expect(postfix[3].value).toBe('*');
      expect(postfix[4].value).toBe('+');
    });

    test('should respect precedence: 2*3+4 → 2 3 * 4 +', () => {
      const tokens = tokenize('2*3+4');
      const postfix = infixToPostfix(tokens);
      expect(postfix[0].value).toBe(2);
      expect(postfix[1].value).toBe(3);
      expect(postfix[2].value).toBe('*');
      expect(postfix[3].value).toBe(4);
      expect(postfix[4].value).toBe('+');
    });

    test('should handle multiple low-precedence operators: 2+3+4', () => {
      const tokens = tokenize('2+3+4');
      const postfix = infixToPostfix(tokens);
      // Expected: 2 3 + 4 +
      expect(postfix[2].value).toBe('+');
      expect(postfix[4].value).toBe('+');
    });

    test('should handle multiple high-precedence operators: 2*3*4', () => {
      const tokens = tokenize('2*3*4');
      const postfix = infixToPostfix(tokens);
      // Expected: 2 3 * 4 *
      expect(postfix[2].value).toBe('*');
      expect(postfix[4].value).toBe('*');
    });
  });

  describe('infixToPostfix() - parentheses', () => {
    test('should handle simple parentheses: (2+3)*4 → 2 3 + 4 *', () => {
      const tokens = tokenize('(2+3)*4');
      const postfix = infixToPostfix(tokens);
      expect(postfix[0].value).toBe(2);
      expect(postfix[1].value).toBe(3);
      expect(postfix[2].value).toBe('+');
      expect(postfix[3].value).toBe(4);
      expect(postfix[4].value).toBe('*');
    });

    test('should handle nested parentheses: ((2+3)*4)', () => {
      const tokens = tokenize('((2+3)*4)');
      const postfix = infixToPostfix(tokens);
      expect(postfix.length).toBe(5);
      expect(postfix[2].value).toBe('+');
      expect(postfix[4].value).toBe('*');
    });

    test('should handle multiple groups: (2+3)*(4+5)', () => {
      const tokens = tokenize('(2+3)*(4+5)');
      const postfix = infixToPostfix(tokens);
      // Expected: 2 3 + 4 5 + *
      expect(postfix[0].value).toBe(2);
      expect(postfix[1].value).toBe(3);
      expect(postfix[2].value).toBe('+');
      expect(postfix[3].value).toBe(4);
      expect(postfix[4].value).toBe(5);
      expect(postfix[5].value).toBe('+');
      expect(postfix[6].value).toBe('*');
    });
  });

  describe('infixToPostfix() - complex expressions', () => {
    test('should convert complex precedence: 2+3*4+5', () => {
      const tokens = tokenize('2+3*4+5');
      const postfix = infixToPostfix(tokens);
      // Expected: 2 3 4 * + 5 +
      expect(postfix[0].value).toBe(2);
      expect(postfix[1].value).toBe(3);
      expect(postfix[2].value).toBe(4);
      expect(postfix[3].value).toBe('*');
      expect(postfix[4].value).toBe('+');
      expect(postfix[5].value).toBe(5);
      expect(postfix[6].value).toBe('+');
    });

    test('should convert mixed operators and parentheses: (2+3)*4/2', () => {
      const tokens = tokenize('(2+3)*4/2');
      const postfix = infixToPostfix(tokens);
      // Expected: 2 3 + 4 * 2 /
      expect(postfix[2].value).toBe('+');
      expect(postfix[4].value).toBe('*');
      expect(postfix[6].value).toBe('/');
    });
  });

  describe('evaluatePostfix() - basic operations', () => {
    test('should evaluate simple addition', () => {
      const tokens = tokenize('2+3');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(5);
    });

    test('should evaluate simple subtraction', () => {
      const tokens = tokenize('5-2');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(3);
    });

    test('should evaluate simple multiplication', () => {
      const tokens = tokenize('3*4');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(12);
    });

    test('should evaluate simple division', () => {
      const tokens = tokenize('8/2');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(4);
    });

    test('should handle decimal results', () => {
      const tokens = tokenize('7/2');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(3.5);
    });
  });

  describe('evaluatePostfix() - precedence and order', () => {
    test('should evaluate with correct precedence: 2+3*4 = 14', () => {
      const tokens = tokenize('2+3*4');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(14);
    });

    test('should evaluate with parentheses: (2+3)*4 = 20', () => {
      const tokens = tokenize('(2+3)*4');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(20);
    });

    test('should handle left-to-right evaluation: 10-3-2 = 5', () => {
      const tokens = tokenize('10-3-2');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(5);
    });

    test('should handle division order: 20/5/2 = 2', () => {
      const tokens = tokenize('20/5/2');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(2);
    });
  });

  describe('evaluatePostfix() - complex expressions', () => {
    test('should evaluate: 2+3*4+5 = 19', () => {
      const tokens = tokenize('2+3*4+5');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(19);
    });

    test('should evaluate: (2+3)*(4+5) = 45', () => {
      const tokens = tokenize('(2+3)*(4+5)');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(45);
    });

    test('should evaluate: 100/10+5*2 = 20', () => {
      const tokens = tokenize('100/10+5*2');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(20);
    });

    test('should handle decimals: 3.5*2.5 = 8.75', () => {
      const tokens = tokenize('3.5*2.5');
      const postfix = infixToPostfix(tokens);
      const result = evaluatePostfix(postfix);
      expect(result).toBe(8.75);
    });
  });

  describe('evaluatePostfix() - error handling', () => {
    test('should throw error on division by zero', () => {
      const tokens = tokenize('5/0');
      const postfix = infixToPostfix(tokens);
      expect(() => evaluatePostfix(postfix)).toThrow('Division by zero');
    });

    test('should throw error on division by zero in complex expression', () => {
      const tokens = tokenize('10/(2-2)');
      const postfix = infixToPostfix(tokens);
      expect(() => evaluatePostfix(postfix)).toThrow('Division by zero');
    });
  });

  describe('evaluateExpression() - end-to-end integration', () => {
    test('should evaluate simple expression', () => {
      expect(evaluateExpression('2+3')).toBe(5);
    });

    test('should evaluate with precedence', () => {
      expect(evaluateExpression('2+3*4')).toBe(14);
    });

    test('should evaluate with parentheses', () => {
      expect(evaluateExpression('(2+3)*4')).toBe(20);
    });

    test('should evaluate complex expression', () => {
      expect(evaluateExpression('(10+5)*2-8/4')).toBe(28);
    });

    test('should handle decimals', () => {
      expect(evaluateExpression('3.5+2.5')).toBe(6);
    });

    test('should handle whitespace', () => {
      expect(evaluateExpression('  2  +  3  ')).toBe(5);
    });

    test('should throw error on division by zero', () => {
      expect(() => evaluateExpression('5/0')).toThrow('Division by zero');
    });

    test('should throw error on empty expression', () => {
      expect(() => evaluateExpression('')).toThrow('Invalid expression');
    });

    test('should throw error on invalid syntax', () => {
      expect(() => evaluateExpression('2++')).toThrow();
    });
  });
});
