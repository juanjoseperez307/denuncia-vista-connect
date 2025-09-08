/**
 * @fileoverview Generating PSeInt for logic blocks.
 */

// Boolean values
(Blockly as any).PSeInt['logic_boolean'] = function(block: any) {
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'Verdadero' : 'Falso';
  return [code, (Blockly as any).PSeInt.ORDER_ATOMIC];
};

// If-then-else
(Blockly as any).PSeInt['controls_if'] = function(block: any) {
  let n = 0;
  let code = '';
  let branchCode, conditionCode;
  
  if ((Blockly as any).PSeInt.STATEMENT_PREFIX) {
    code += (Blockly as any).PSeInt.injectId((Blockly as any).PSeInt.STATEMENT_PREFIX, block);
  }
  
  do {
    conditionCode = (Blockly as any).PSeInt.valueToCode(block, 'IF' + n,
      (Blockly as any).PSeInt.ORDER_NONE) || 'Falso';
    branchCode = (Blockly as any).PSeInt.statementToCode(block, 'DO' + n);
    
    if ((Blockly as any).PSeInt.STATEMENT_SUFFIX) {
      branchCode = (Blockly as any).PSeInt.prefixLines(
        (Blockly as any).PSeInt.injectId((Blockly as any).PSeInt.STATEMENT_SUFFIX, block), 
        (Blockly as any).PSeInt.INDENT) + branchCode;
    }
    
    code += (n > 0 ? 'Sino ' : '') + 'Si ' + conditionCode + ' Entonces\n' + branchCode;
    n++;
  } while (block.getInput('IF' + n));
  
  if (block.getInput('ELSE')) {
    branchCode = (Blockly as any).PSeInt.statementToCode(block, 'ELSE');
    if ((Blockly as any).PSeInt.STATEMENT_SUFFIX) {
      branchCode = (Blockly as any).PSeInt.prefixLines(
        (Blockly as any).PSeInt.injectId((Blockly as any).PSeInt.STATEMENT_SUFFIX, block), 
        (Blockly as any).PSeInt.INDENT) + branchCode;
    }
    code += 'Sino\n' + branchCode;
  }
  
  return code + 'FinSi\n';
};

// Comparison operators
(Blockly as any).PSeInt['logic_compare'] = function(block: any) {
  const OPERATORS: {[key: string]: [string, number]} = {
    'EQ': ['=', (Blockly as any).PSeInt.ORDER_EQUALITY],
    'NEQ': ['<>', (Blockly as any).PSeInt.ORDER_EQUALITY],
    'LT': ['<', (Blockly as any).PSeInt.ORDER_RELATIONAL],
    'LTE': ['<=', (Blockly as any).PSeInt.ORDER_RELATIONAL],
    'GT': ['>', (Blockly as any).PSeInt.ORDER_RELATIONAL],
    'GTE': ['>=', (Blockly as any).PSeInt.ORDER_RELATIONAL]
  };
  const tuple = OPERATORS[block.getFieldValue('OP')];
  const operator = tuple[0];
  const order = tuple[1];
  const argument0 = (Blockly as any).PSeInt.valueToCode(block, 'A', order) || '0';
  const argument1 = (Blockly as any).PSeInt.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

// Logical operations
(Blockly as any).PSeInt['logic_operation'] = function(block: any) {
  const operator = (block.getFieldValue('OP') === 'AND') ? 'Y' : 'O';
  const order = (operator === 'Y') ? 
    (Blockly as any).PSeInt.ORDER_LOGICAL_AND : 
    (Blockly as any).PSeInt.ORDER_LOGICAL_OR;
  const argument0 = (Blockly as any).PSeInt.valueToCode(block, 'A', order);
  const argument1 = (Blockly as any).PSeInt.valueToCode(block, 'B', order);
  
  if (!argument0 && !argument1) {
    const value = (operator === 'Y') ? 'Verdadero' : 'Falso';
    return [value, (Blockly as any).PSeInt.ORDER_ATOMIC];
  }
  
  const defaultArgument = (operator === 'Y') ? 'Verdadero' : 'Falso';
  const arg0 = argument0 || defaultArgument;
  const arg1 = argument1 || defaultArgument;
  
  const code = '(' + arg0 + ') ' + operator + ' (' + arg1 + ')';
  return [code, order];
};

// Negation
(Blockly as any).PSeInt['logic_negate'] = function(block: any) {
  const order = (Blockly as any).PSeInt.ORDER_LOGICAL_NOT;
  const argument0 = (Blockly as any).PSeInt.valueToCode(block, 'BOOL', order) || 'Verdadero';
  const code = 'NO (' + argument0 + ')';
  return [code, order];
};