/**
 * @fileoverview Generating PSeInt for loop blocks.
 */

// While loop
(Blockly as any).PSeInt['controls_whileUntil'] = function(block: any) {
  const until = block.getFieldValue('MODE') === 'UNTIL';
  let argument0 = (Blockly as any).PSeInt.valueToCode(block, 'BOOL',
    until ? (Blockly as any).PSeInt.ORDER_LOGICAL_NOT : (Blockly as any).PSeInt.ORDER_NONE) || 'Falso';
  let branch = (Blockly as any).PSeInt.statementToCode(block, 'DO');
  branch = (Blockly as any).PSeInt.addLoopTrap(branch, block);
  
  if (until) {
    argument0 = 'NO (' + argument0 + ')';
  }
  
  return 'Mientras ' + argument0 + ' Hacer\n' + branch + 'FinMientras\n';
};

// Repeat loop
(Blockly as any).PSeInt['controls_repeat_ext'] = function(block: any) {
  if (block.getField('TIMES')) {
    // Internal number
    const repeats = String(Number(block.getFieldValue('TIMES')));
    var branch = (Blockly as any).PSeInt.statementToCode(block, 'DO');
    branch = (Blockly as any).PSeInt.addLoopTrap(branch, block);
    
    const loopVar = (Blockly as any).PSeInt.variableDB_.getDistinctName('i', (Blockly as any).VARIABLE_CATEGORY_NAME);
    return 'Para ' + loopVar + ' <- 1 Hasta ' + repeats + ' Hacer\n' + branch + 'FinPara\n';
  } else {
    // External number
    const repeats = (Blockly as any).PSeInt.valueToCode(block, 'TIMES',
      (Blockly as any).PSeInt.ORDER_ASSIGNMENT) || '0';
    var branch = (Blockly as any).PSeInt.statementToCode(block, 'DO');
    branch = (Blockly as any).PSeInt.addLoopTrap(branch, block);
    
    const loopVar = (Blockly as any).PSeInt.variableDB_.getDistinctName('i', (Blockly as any).VARIABLE_CATEGORY_NAME);
    return 'Para ' + loopVar + ' <- 1 Hasta ' + repeats + ' Hacer\n' + branch + 'FinPara\n';
  }
};

// For loop
(Blockly as any).PSeInt['controls_for'] = function(block: any) {
  const variable0 = (Blockly as any).PSeInt.variableDB_.getName(
    block.getFieldValue('VAR'), (Blockly as any).VARIABLE_CATEGORY_NAME);
  const argument0 = (Blockly as any).PSeInt.valueToCode(block, 'FROM',
    (Blockly as any).PSeInt.ORDER_ASSIGNMENT) || '1';
  const argument1 = (Blockly as any).PSeInt.valueToCode(block, 'TO',
    (Blockly as any).PSeInt.ORDER_ASSIGNMENT) || '10';
  const increment = (Blockly as any).PSeInt.valueToCode(block, 'BY',
    (Blockly as any).PSeInt.ORDER_ASSIGNMENT) || '1';
  let branch = (Blockly as any).PSeInt.statementToCode(block, 'DO');
  branch = (Blockly as any).PSeInt.addLoopTrap(branch, block);
  
  let code = 'Para ' + variable0 + ' <- ' + argument0 + ' Hasta ' + argument1;
  
  if (increment !== '1') {
    code += ' Con Paso ' + increment;
  }
  
  code += ' Hacer\n' + branch + 'FinPara\n';
  return code;
};

// Repeat-until loop (PSeInt specific)
(Blockly as any).PSeInt['controls_repeat_until'] = function(block: any) {
  const condition = (Blockly as any).PSeInt.valueToCode(block, 'BOOL',
    (Blockly as any).PSeInt.ORDER_NONE) || 'Falso';
  let branch = (Blockly as any).PSeInt.statementToCode(block, 'DO');
  branch = (Blockly as any).PSeInt.addLoopTrap(branch, block);
  
  return 'Repetir\n' + branch + 'Hasta Que ' + condition + '\n';
};

// Switch statement (Segun)
(Blockly as any).PSeInt['controls_switch'] = function(block: any) {
  const variable = (Blockly as any).PSeInt.valueToCode(block, 'VAR',
    (Blockly as any).PSeInt.ORDER_NONE) || '0';
  let code = 'Segun ' + variable + ' Hacer\n';
  
  for (let i = 0; i < block.caseCount_; i++) {
    const caseValue = (Blockly as any).PSeInt.valueToCode(block, 'CASE' + i,
      (Blockly as any).PSeInt.ORDER_NONE) || '0';
    const caseCode = (Blockly as any).PSeInt.statementToCode(block, 'DO' + i);
    code += '\t' + caseValue + ': ' + caseCode;
  }
  
  if (block.defaultCount_) {
    const defaultCode = (Blockly as any).PSeInt.statementToCode(block, 'DEFAULT');
    code += '\tDe Otro Modo: ' + defaultCode;
  }
  
  code += 'FinSegun\n';
  return code;
};