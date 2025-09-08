/**
 * @fileoverview Generating PSeInt for basic blocks.
 */

// Basic blocks

// Program structure
(Blockly as any).PSeInt['pseint_program'] = function(block: any) {
  const programName = block.getFieldValue('NAME') || 'SinTitulo';
  const statements = (Blockly as any).PSeInt.statementToCode(block, 'STATEMENTS');
  
  const code = `Proceso ${programName}\n${statements}FinProceso`;
  return code;
};

// Assignment
(Blockly as any).PSeInt['pseint_assign'] = function(block: any) {
  const variable = (Blockly as any).PSeInt.variableDB_.getName(
    block.getFieldValue('VAR'), (Blockly as any).VARIABLE_CATEGORY_NAME);
  const value = (Blockly as any).PSeInt.valueToCode(block, 'VALUE',
    (Blockly as any).PSeInt.ORDER_ASSIGNMENT) || '0';
  return variable + ' <- ' + value + ';\n';
};

// Read input
(Blockly as any).PSeInt['pseint_read'] = function(block: any) {
  const variables = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const variable = (Blockly as any).PSeInt.variableDB_.getName(
      block.getFieldValue('VAR' + i), (Blockly as any).VARIABLE_CATEGORY_NAME);
    variables.push(variable);
  }
  return 'Leer ' + variables.join(', ') + ';\n';
};

// Write output
(Blockly as any).PSeInt['pseint_write'] = function(block: any) {
  const expressions = [];
  for (let i = 0; i < block.itemCount_; i++) {
    const expression = (Blockly as any).PSeInt.valueToCode(block, 'EXPR' + i,
      (Blockly as any).PSeInt.ORDER_COMMA) || '""';
    expressions.push(expression);
  }
  return 'Escribir ' + expressions.join(', ') + ';\n';
};

// Dimension arrays
(Blockly as any).PSeInt['pseint_dimension'] = function(block: any) {
  const variable = (Blockly as any).PSeInt.variableDB_.getName(
    block.getFieldValue('VAR'), (Blockly as any).VARIABLE_CATEGORY_NAME);
  const size = (Blockly as any).PSeInt.valueToCode(block, 'SIZE',
    (Blockly as any).PSeInt.ORDER_ATOMIC) || '10';
  return 'Dimension ' + variable + '[' + size + '];\n';
};

// Variables
(Blockly as any).PSeInt['variables_get'] = function(block: any) {
  const code = (Blockly as any).PSeInt.variableDB_.getName(
    block.getFieldValue('VAR'), (Blockly as any).VARIABLE_CATEGORY_NAME);
  return [code, (Blockly as any).PSeInt.ORDER_ATOMIC];
};

(Blockly as any).PSeInt['variables_set'] = function(block: any) {
  const argument0 = (Blockly as any).PSeInt.valueToCode(block, 'VALUE',
    (Blockly as any).PSeInt.ORDER_ASSIGNMENT) || '0';
  const varName = (Blockly as any).PSeInt.variableDB_.getName(
    block.getFieldValue('VAR'), (Blockly as any).VARIABLE_CATEGORY_NAME);
  return varName + ' <- ' + argument0 + ';\n';
};