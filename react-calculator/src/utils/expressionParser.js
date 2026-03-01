// Purpose: Safe math expression parser with tokenizer, infix-to-postfix converter, and evaluator.
// Inputs: expression (string) — mathematical expression from calculator UI (e.g., "2+3*4")
// Outputs: Returns evaluated numeric result or throws controlled TypeError/SyntaxError
// Behavior: Tokenizes expression, converts infix to postfix notation (Shunting Yard), evaluates safely.
//   Does NOT use eval() — all operations are safe and explicit.

// ============================================================================
// TOKENIZER
// ============================================================================

/**
 * Token types for expression parsing
 */
const TOKEN_TYPES = {
  NUMBER: 'NUMBER',      // Integer or decimal number
  OPERATOR: 'OPERATOR',  // +, -, *, /
  LPAREN: 'LPAREN',      // (
  RPAREN: 'RPAREN',      // )
  EOF: 'EOF',            // End of input
};

/**
 * Represents a single token in the expression
 */
class Token {
  constructor(type, value, position = 0) {
    this.type = type;
    this.value = value;
    this.position = position;
  }

  toString() {
    return `Token(${this.type}, ${this.value})`;
  }
}

/**
 * Tokenize a mathematical expression string
 * Scans input and extracts tokens: numbers, operators, parentheses
 * 
 * @param {string} expression - The math expression to tokenize
 * @returns {Token[]} Array of parsed tokens
 * @throws {SyntaxError} If invalid characters or malformed numbers found
 */
function tokenize(expression) {
  if (typeof expression !== 'string') {
    throw new TypeError('Expression must be a string');
  }

  const tokens = [];
  let position = 0;
  const input = expression.trim();

  if (input.length === 0) {
    throw new SyntaxError('Expression cannot be empty');
  }

  while (position < input.length) {
    const char = input[position];

    // Skip whitespace
    if (/\s/.test(char)) {
      position++;
      continue;
    }

    // Parse numbers (integer or decimal)
    if (/\d/.test(char)) {
      let numberStr = '';
      let hasDecimal = false;

      while (position < input.length) {
        const c = input[position];

        if (/\d/.test(c)) {
          numberStr += c;
          position++;
        } else if (c === '.' && !hasDecimal) {
          // Allow exactly one decimal point per number
          hasDecimal = true;
          numberStr += c;
          position++;
        } else {
          // Stop when we hit non-digit, non-decimal character
          break;
        }
      }

      // Validate number format (no trailing/leading decimals like "." or "1.")
      if (numberStr === '.' || numberStr.endsWith('.')) {
        throw new SyntaxError(`Invalid number format: "${numberStr}" at position ${position - numberStr.length}`);
      }

      const numValue = parseFloat(numberStr);
      tokens.push(new Token(TOKEN_TYPES.NUMBER, numValue, position - numberStr.length));
      continue;
    }

    // Parse operators
    if (['+', '-', '*', '/'].includes(char)) {
      tokens.push(new Token(TOKEN_TYPES.OPERATOR, char, position));
      position++;
      continue;
    }

    // Parse left parenthesis
    if (char === '(') {
      tokens.push(new Token(TOKEN_TYPES.LPAREN, '(', position));
      position++;
      continue;
    }

    // Parse right parenthesis
    if (char === ')') {
      tokens.push(new Token(TOKEN_TYPES.RPAREN, ')', position));
      position++;
      continue;
    }

    // Unknown character
    throw new SyntaxError(`Invalid character: "${char}" at position ${position}`);
  }

  // Add EOF marker
  tokens.push(new Token(TOKEN_TYPES.EOF, '', position));

  return tokens;
}

/**
 * Validate token sequence for basic syntax errors
 * Checks for mismatched parentheses, invalid operator placement
 * 
 * @param {Token[]} tokens - Array of tokens to validate
 * @throws {SyntaxError} If token sequence is invalid
 */
function validateTokens(tokens) {
  let parenDepth = 0;
  let lastTokenType = null;

  for (let i = 0; i < tokens.length - 1; i++) {
    // Note: We skip EOF token (last one)
    const token = tokens[i];
    const nextToken = tokens[i + 1];

    // Track parentheses matching
    if (token.type === TOKEN_TYPES.LPAREN) {
      parenDepth++;
    } else if (token.type === TOKEN_TYPES.RPAREN) {
      parenDepth--;
      if (parenDepth < 0) {
        throw new SyntaxError(`Unexpected closing parenthesis at position ${token.position}`);
      }
    }

    // Validate operator placement
    if (token.type === TOKEN_TYPES.OPERATOR) {
      // Operator cannot be first token
      if (i === 0) {
        throw new SyntaxError(`Expression cannot start with operator: "${token.value}"`);
      }
      // Operator cannot follow another operator (no ++ or */)
      if (lastTokenType === TOKEN_TYPES.OPERATOR) {
        throw new SyntaxError(`Consecutive operators not allowed: "${tokens[i - 1].value}" followed by "${token.value}"`);
      }
      // Operator cannot precede ) or EOF
      if (nextToken.type === TOKEN_TYPES.RPAREN || nextToken.type === TOKEN_TYPES.EOF) {
        throw new SyntaxError(`Expression cannot end with operator: "${token.value}"`);
      }
    }

    lastTokenType = token.type;
  }

  // Check for mismatched parentheses
  if (parenDepth !== 0) {
    throw new SyntaxError(`Mismatched parentheses: ${parenDepth > 0 ? 'unclosed' : 'extra closing'} parenthesis`);
  }
}

// ============================================================================
// SHUNTING YARD ALGORITHM (Infix to Postfix Conversion)
// ============================================================================

/**
 * Operator precedence table
 * Higher values = higher precedence
 */
const PRECEDENCE = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
};

/**
 * Check if operator1 has higher or equal precedence than operator2
 * @param {string} op1 - First operator
 * @param {string} op2 - Second operator
 * @returns {boolean} True if op1 >= op2 in precedence
 */
function hasHigherOrEqualPrecedence(op1, op2) {
  return PRECEDENCE[op1] >= PRECEDENCE[op2];
}

/**
 * Convert infix expression tokens to postfix notation (Reverse Polish Notation)
 * Uses Dijkstra's Shunting Yard algorithm
 * 
 * Example: "2 + 3 * 4" (infix) → "2 3 4 * +" (postfix)
 * 
 * Algorithm:
 * 1. Scan tokens from left to right
 * 2. Numbers go directly to output queue
 * 3. Operators go to operator stack, respecting precedence
 * 4. Left parenthesis goes to stack
 * 5. Right parenthesis pops stack until matching left parenthesis
 * 6. At end, pop all remaining operators to output
 * 
 * @param {Token[]} tokens - Array of infix tokens (from tokenize())
 * @returns {Token[]} Array of postfix tokens
 * @throws {SyntaxError} If expression structure is invalid
 */
function infixToPostfix(tokens) {
  const outputQueue = [];
  const operatorStack = [];

  // Process each token (skip EOF token at end)
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];

    // Rule 1: Numbers go directly to output
    if (token.type === TOKEN_TYPES.NUMBER) {
      outputQueue.push(token);
      continue;
    }

    // Rule 2: Operators - apply precedence rules
    if (token.type === TOKEN_TYPES.OPERATOR) {
      // Pop operators from stack to output if they have higher/equal precedence
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1].type === TOKEN_TYPES.OPERATOR &&
        hasHigherOrEqualPrecedence(operatorStack[operatorStack.length - 1].value, token.value)
      ) {
        outputQueue.push(operatorStack.pop());
      }
      
      // Push current operator onto stack
      operatorStack.push(token);
      continue;
    }

    // Rule 3: Left parenthesis - push to stack
    if (token.type === TOKEN_TYPES.LPAREN) {
      operatorStack.push(token);
      continue;
    }

    // Rule 4: Right parenthesis - pop until matching left parenthesis
    if (token.type === TOKEN_TYPES.RPAREN) {
      let foundMatchingParen = false;

      // Pop operators until we find the matching left parenthesis
      while (operatorStack.length > 0) {
        const top = operatorStack.pop();
        
        if (top.type === TOKEN_TYPES.LPAREN) {
          foundMatchingParen = true;
          break;
        }
        
        outputQueue.push(top);
      }

      // Safety check (should never happen if validateTokens ran)
      if (!foundMatchingParen) {
        throw new SyntaxError(`Mismatched parentheses at position ${token.position}`);
      }
      continue;
    }
  }

  // Rule 5: Pop all remaining operators from stack to output
  while (operatorStack.length > 0) {
    const top = operatorStack.pop();
    
    // Unclosed parenthesis check (should never happen if validateTokens ran)
    if (top.type === TOKEN_TYPES.LPAREN) {
      throw new SyntaxError('Mismatched parentheses: unclosed left parenthesis');
    }
    
    outputQueue.push(top);
  }

  return outputQueue;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Token, TOKEN_TYPES, tokenize, validateTokens, infixToPostfix };

/**
 * Main entry point: Evaluate expression safely
 * This is a placeholder that will integrate tokenize + shunting-yard + evaluator
 * 
 * @param {string} expression - Math expression to evaluate
 * @returns {number} Evaluated result
 * @throws {Error} If expression is invalid or evaluation fails
 */
export function evaluateExpression(expression) {
  if (typeof expression !== 'string' || expression.trim() === '') {
    throw new Error('Invalid expression');
  }

  try {
    // Task 6: Tokenize
    const tokens = tokenize(expression);
    
    // Validate token sequence
    validateTokens(tokens);

    // Task 7: Convert infix to postfix (Shunting Yard)
    const postfixTokens = infixToPostfix(tokens);

    // TODO: Task 8 - Evaluate postfix expression
    // const result = evaluatePostfix(postfixTokens);

    // Temporary placeholder - return postfix for debugging
    throw new Error('Postfix evaluator not yet implemented (Task 8)');
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Parse error: ${err.message}`);
    }
    throw err;
  }
}
