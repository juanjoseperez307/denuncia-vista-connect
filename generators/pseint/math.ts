/**
 * @fileoverview Generating PSeInt for math blocks.
 */

// Numbers
(Blockly as any).PSeInt['math_number'] = function(block: any) {
  let code = Number(block.getFieldValue('NUM'));
  const order = code >= 0 ? (Blockly as any).PSeInt.ORDER_ATOMIC : (Blockly as any).PSeInt.ORDER_UNARY_NEGATION;
  return [code, order];
};

// Arithmetic operations
(Blockly as any).PSeInt['math_arithmetic'] = function(block: any) {
  const OPERATORS: {[key: string]: [string, number]} = {
    'ADD': [' + ', (Blockly as any).PSeInt.ORDER_ADDITION],
    'MINUS': [' - ', (Blockly as any).PSeInt.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', (Blockly as any).PSeInt.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', (Blockly as any).PSeInt.ORDER_DIVISION],
    'POWER': [' ^ ', (Blockly as any).PSeInt.ORDER_EXPONENTIATION]
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = (Blockly as any).PSeInt.valueToCode(block, 'A', order) || '0';
  const argument1 = (Blockly as any).PSeInt.valueToCode(block, 'B', order) || '0';
  const code = argument0 + operator + argument1;
  return [code, order];
};

// Single mathematical operations (functions)
(Blockly as any).PSeInt['math_single'] = function(block: any) {
  const operator = block.getFieldValue('OP');
  let code;
  let arg;
  
  if (operator === 'NEG') {
    arg = (Blockly as any).PSeInt.valueToCode(block, 'NUM',
      (Blockly as any).PSeInt.ORDER_UNARY_NEGATION) || '0';
    return ['-' + arg, (Blockly as any).PSeInt.ORDER_UNARY_NEGATION];
  }
  
  if (operator === 'SIN' || operator === 'COS' || operator === 'TAN') {
    arg = (Blockly as any).PSeInt.valueToCode(block, 'NUM',
      (Blockly as any).PSeInt.ORDER_DIVISION) || '0';
  } else {
    arg = (Blockly as any).PSeInt.valueToCode(block, 'NUM',
      (Blockly as any).PSeInt.ORDER_NONE) || '0';
  }
  
  switch (operator) {
    case 'ABS':
      code = 'ABS(' + arg + ')';
      break;
    case 'ROOT':
      code = 'RC(' + arg + ')';
      break;
    case 'LN':
      code = 'LN(' + arg + ')';
      break;
    case 'EXP':
      code = 'EXP(' + arg + ')';
      break;
    case 'POW10':
      code = 'EXP(' + arg + ' * LN(10))';
      break;
    case 'ROUND':
      code = 'REDON(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'TRUNC(' + arg + ' + 0.5)';
      break;
    case 'ROUNDDOWN':
      code = 'TRUNC(' + arg + ')';
      break;
    case 'SIN':
      code = 'SEN(' + arg + ')';
      break;
    case 'COS':
      code = 'COS(' + arg + ')';
      break;
    case 'TAN':
      code = 'SEN(' + arg + ') / COS(' + arg + ')';
      break;
    case 'ASIN':
      code = 'ATAN(' + arg + ' / RC(1 - ' + arg + ' ^ 2))';
      break;
    case 'ACOS':
      code = 'ATAN(RC(1 - ' + arg + ' ^ 2) / ' + arg + ')';
      break;
    case 'ATAN':
      code = 'ATAN(' + arg + ')';
      break;
    default:
      throw Error('Unknown math operator: ' + operator);
  }
  return [code, (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
};

// Modulo operation
(Blockly as any).PSeInt['math_modulo'] = function(block: any) {
  const argument0 = (Blockly as any).PSeInt.valueToCode(block, 'DIVIDEND',
    (Blockly as any).PSeInt.ORDER_MODULUS) || '0';
  const argument1 = (Blockly as any).PSeInt.valueToCode(block, 'DIVISOR',
    (Blockly as any).PSeInt.ORDER_MODULUS) || '1';
  const code = argument0 + ' MOD ' + argument1;
  return [code, (Blockly as any).PSeInt.ORDER_MODULUS];
};

// Random number
(Blockly as any).PSeInt['math_random_int'] = function(block: any) {
  const argument0 = (Blockly as any).PSeInt.valueToCode(block, 'FROM',
    (Blockly as any).PSeInt.ORDER_NONE) || '0';
  const argument1 = (Blockly as any).PSeInt.valueToCode(block, 'TO',
    (Blockly as any).PSeInt.ORDER_NONE) || '0';
  const code = argument0 + ' + AZAR(' + argument1 + ' - ' + argument0 + ' + 1)';
  return [code, (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
};

// Random float
(Blockly as any).PSeInt['math_random_float'] = function(block: any) {
  return ['AZAR(100) / 100', (Blockly as any).PSeInt.ORDER_DIVISION];
};