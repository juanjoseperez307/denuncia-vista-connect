/**
 * @fileoverview Generating PSeInt for text blocks.
 */

// Text string
(Blockly as any).PSeInt['text'] = function(block: any) {
  const code = (Blockly as any).PSeInt.quote_(block.getFieldValue('TEXT'));
  return [code, (Blockly as any).PSeInt.ORDER_ATOMIC];
};

// Text join
(Blockly as any).PSeInt['text_join'] = function(block: any) {
  if (block.itemCount_ === 0) {
    return ['""', (Blockly as any).PSeInt.ORDER_ATOMIC];
  } else if (block.itemCount_ === 1) {
    const element = (Blockly as any).PSeInt.valueToCode(block, 'ADD0',
      (Blockly as any).PSeInt.ORDER_NONE) || '""';
    return [element, (Blockly as any).PSeInt.ORDER_NONE];
  } else {
    const elements = [];
    for (let i = 0; i < block.itemCount_; i++) {
      elements[i] = (Blockly as any).PSeInt.valueToCode(block, 'ADD' + i,
        (Blockly as any).PSeInt.ORDER_COMMA) || '""';
    }
    const code = 'Concatenar(' + elements.join(', ') + ')';
    return [code, (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
  }
};

// Text length
(Blockly as any).PSeInt['text_length'] = function(block: any) {
  const text = (Blockly as any).PSeInt.valueToCode(block, 'VALUE',
    (Blockly as any).PSeInt.ORDER_FUNCTION_CALL) || '""';
  const code = 'Longitud(' + text + ')';
  return [code, (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
};

// Text isEmpty
(Blockly as any).PSeInt['text_isEmpty'] = function(block: any) {
  const text = (Blockly as any).PSeInt.valueToCode(block, 'VALUE',
    (Blockly as any).PSeInt.ORDER_FUNCTION_CALL) || '""';
  const code = 'Longitud(' + text + ') = 0';
  return [code, (Blockly as any).PSeInt.ORDER_EQUALITY];
};

// Text indexOf
(Blockly as any).PSeInt['text_indexOf'] = function(block: any) {
  const operator = block.getFieldValue('END') === 'FIRST' ? 'Encontrar' : 'EncontrarUltimo';
  const substring = (Blockly as any).PSeInt.valueToCode(block, 'FIND',
    (Blockly as any).PSeInt.ORDER_NONE) || '""';
  const text = (Blockly as any).PSeInt.valueToCode(block, 'VALUE',
    (Blockly as any).PSeInt.ORDER_NONE) || '""';
  const code = operator + '(' + text + ', ' + substring + ')';
  return [code, (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
};

// Text charAt
(Blockly as any).PSeInt['text_charAt'] = function(block: any) {
  const where = block.getFieldValue('WHERE') || 'FROM_START';
  const textOrder = (where === 'RANDOM') ? (Blockly as any).PSeInt.ORDER_NONE :
    (Blockly as any).PSeInt.ORDER_FUNCTION_CALL;
  const text = (Blockly as any).PSeInt.valueToCode(block, 'VALUE', textOrder) || '""';
  
  switch (where) {
    case 'FIRST':
      return ['SubCadena(' + text + ', 1, 1)', (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
    case 'LAST':
      return ['SubCadena(' + text + ', Longitud(' + text + '), 1)', (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
    case 'FROM_START': {
      const at = (Blockly as any).PSeInt.getAdjusted(block, 'AT');
      return ['SubCadena(' + text + ', ' + at + ', 1)', (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
    }
    case 'FROM_END': {
      const at = (Blockly as any).PSeInt.getAdjusted(block, 'AT', 1, true);
      return ['SubCadena(' + text + ', Longitud(' + text + ') ' + at + ', 1)', (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
    }
    case 'RANDOM':
      return ['SubCadena(' + text + ', AZAR(Longitud(' + text + ')) + 1, 1)', (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
    default:
      throw Error('Unhandled option (text_charAt).');
  }
};

// Text substring
(Blockly as any).PSeInt['text_getSubstring'] = function(block: any) {
  const text = (Blockly as any).PSeInt.valueToCode(block, 'STRING',
    (Blockly as any).PSeInt.ORDER_FUNCTION_CALL) || '""';
  const where1 = block.getFieldValue('WHERE1');
  const where2 = block.getFieldValue('WHERE2');
  
  let at1;
  switch (where1) {
    case 'FROM_START':
      at1 = (Blockly as any).PSeInt.getAdjusted(block, 'AT1');
      break;
    case 'FROM_END':
      at1 = (Blockly as any).PSeInt.getAdjusted(block, 'AT1', 1, true);
      at1 = 'Longitud(' + text + ') ' + at1;
      break;
    case 'FIRST':
      at1 = '1';
      break;
    default:
      throw Error('Unhandled option (text_getSubstring).');
  }
  
  let at2;
  switch (where2) {
    case 'FROM_START':
      at2 = (Blockly as any).PSeInt.getAdjusted(block, 'AT2');
      break;
    case 'FROM_END':
      at2 = (Blockly as any).PSeInt.getAdjusted(block, 'AT2', 1, true);
      at2 = 'Longitud(' + text + ') ' + at2;
      break;
    case 'LAST':
      at2 = 'Longitud(' + text + ')';
      break;
    default:
      throw Error('Unhandled option (text_getSubstring).');
  }
  
  const code = 'SubCadena(' + text + ', ' + at1 + ', ' + at2 + ' - ' + at1 + ' + 1)';
  return [code, (Blockly as any).PSeInt.ORDER_FUNCTION_CALL];
};