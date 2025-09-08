/**
 * @fileoverview Generator for PSeInt pseudocode language.
 * Based on the PSeInt syntax specification from https://pseint.sourceforge.net/
 */

// Create PSeInt generator
(Blockly as any).PSeInt = new (Blockly as any).Generator('PSeInt');

// Define order of operations precedence
(Blockly as any).PSeInt.ORDER_ATOMIC = 0;           // 0 "" ...
(Blockly as any).PSeInt.ORDER_NEW = 1.1;            // new
(Blockly as any).PSeInt.ORDER_MEMBER = 1.2;         // . []
(Blockly as any).PSeInt.ORDER_FUNCTION_CALL = 2;    // ()
(Blockly as any).PSeInt.ORDER_INCREMENT = 3;        // ++
(Blockly as any).PSeInt.ORDER_DECREMENT = 3;        // --
(Blockly as any).PSeInt.ORDER_BITWISE_NOT = 4.1;    // ~
(Blockly as any).PSeInt.ORDER_UNARY_PLUS = 4.2;     // +
(Blockly as any).PSeInt.ORDER_UNARY_NEGATION = 4.3; // -
(Blockly as any).PSeInt.ORDER_LOGICAL_NOT = 4.4;    // NO
(Blockly as any).PSeInt.ORDER_TYPEOF = 4.5;         // typeof
(Blockly as any).PSeInt.ORDER_VOID = 4.6;           // void
(Blockly as any).PSeInt.ORDER_DELETE = 4.7;         // delete
(Blockly as any).PSeInt.ORDER_AWAIT = 4.8;          // await
(Blockly as any).PSeInt.ORDER_EXPONENTIATION = 5.0; // ^
(Blockly as any).PSeInt.ORDER_MULTIPLICATION = 5.1; // *
(Blockly as any).PSeInt.ORDER_DIVISION = 5.2;       // /
(Blockly as any).PSeInt.ORDER_MODULUS = 5.3;        // MOD
(Blockly as any).PSeInt.ORDER_SUBTRACTION = 6.1;    // -
(Blockly as any).PSeInt.ORDER_ADDITION = 6.2;       // +
(Blockly as any).PSeInt.ORDER_BITWISE_SHIFT = 7;    // << >> >>>
(Blockly as any).PSeInt.ORDER_RELATIONAL = 8;       // < <= > >=
(Blockly as any).PSeInt.ORDER_IN = 8;               // in
(Blockly as any).PSeInt.ORDER_INSTANCEOF = 8;       // instanceof
(Blockly as any).PSeInt.ORDER_EQUALITY = 9;         // = <>
(Blockly as any).PSeInt.ORDER_BITWISE_AND = 10;     // &
(Blockly as any).PSeInt.ORDER_BITWISE_XOR = 11;     // ^
(Blockly as any).PSeInt.ORDER_BITWISE_OR = 12;      // |
(Blockly as any).PSeInt.ORDER_LOGICAL_AND = 13;     // Y
(Blockly as any).PSeInt.ORDER_LOGICAL_OR = 14;      // O
(Blockly as any).PSeInt.ORDER_CONDITIONAL = 15;     // ?:
(Blockly as any).PSeInt.ORDER_ASSIGNMENT = 16;      // <-
(Blockly as any).PSeInt.ORDER_YIELD = 17;           // yield
(Blockly as any).PSeInt.ORDER_COMMA = 18;           // ,
(Blockly as any).PSeInt.ORDER_NONE = 99;            // (...)

// Reserved words in PSeInt
(Blockly as any).PSeInt.addReservedWords(
  'Proceso,FinProceso,Si,Entonces,Sino,FinSi,Mientras,FinMientras,Para,FinPara,' +
  'Repetir,Hasta,Que,Segun,Hacer,FinSegun,De,Otro,Modo,Leer,Escribir,Dimension,' +
  'Verdadero,Falso,Y,O,NO,MOD,RC,ABS,LN,EXP,SEN,COS,ATAN,TRUNC,REDON,AZAR,' +
  'Con,Paso'
);

/**
 * Initialise the database of variable names.
 * @param {Blockly.Workspace} workspace Workspace to generate code from.
 */
(Blockly as any).PSeInt.init = function(workspace: any) {
  // Create a dictionary of definitions to be printed before the code.
  (Blockly as any).PSeInt.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  (Blockly as any).PSeInt.functionNames_ = Object.create(null);

  if (!(Blockly as any).PSeInt.variableDB_) {
    (Blockly as any).PSeInt.variableDB_ = new (Blockly as any).Names((Blockly as any).PSeInt.RESERVED_WORDS_);
  } else {
    (Blockly as any).PSeInt.variableDB_.reset();
  }

  (Blockly as any).PSeInt.variableDB_.setVariableMap(workspace.getVariableMap());
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
(Blockly as any).PSeInt.finish = function(code: string) {
  // Convert the definitions dictionary into a list.
  const definitions = [];
  for (const name in (Blockly as any).PSeInt.definitions_) {
    definitions.push((Blockly as any).PSeInt.definitions_[name]);
  }
  
  // Clean up temporary data.
  delete (Blockly as any).PSeInt.definitions_;
  delete (Blockly as any).PSeInt.functionNames_;
  (Blockly as any).PSeInt.variableDB_.reset();
  
  return definitions.join('\n\n') + '\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
(Blockly as any).PSeInt.scrubNakedValue = function(line: string) {
  return line + ';\n';
};

/**
 * Encode a string as a properly escaped PSeInt string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} PSeInt string.
 * @protected
 */
(Blockly as any).PSeInt.quote_ = function(string: string) {
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\n')
                 .replace(/"/g, '\\"');
  return '"' + string + '"';
};

/**
 * Encode a string as a properly escaped multiline PSeInt string, complete
 * with quotes.
 * @param {string} string Text to encode.
 * @return {string} PSeInt string.
 * @protected
 */
(Blockly as any).PSeInt.multiline_quote_ = function(string: string) {
  const lines = string.split(/\n/g).map((Blockly as any).PSeInt.quote_);
  return lines.join(' + "\\n" +\n');
};

/**
 * Common tasks for generating PSeInt from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The PSeInt code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} PSeInt code with comments and subsequent blocks added.
 * @protected
 */
(Blockly as any).PSeInt.scrub_ = function(block: any, code: string, opt_thisOnly?: boolean) {
  let commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    let comment = block.getCommentText();
    if (comment) {
      comment = (Blockly as any).utils.string.wrap(comment, (Blockly as any).PSeInt.COMMENT_WRAP - 3);
      commentCode += (Blockly as any).PSeInt.prefixLines(comment + '\n', '// ');
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (let i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type === (Blockly as any).INPUT_VALUE) {
        const childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = (Blockly as any).PSeInt.allNestedComments(childBlock);
          if (comment) {
            commentCode += (Blockly as any).PSeInt.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = opt_thisOnly ? '' : (Blockly as any).PSeInt.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Blockly.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string} The adjusted value or code.
 */
(Blockly as any).PSeInt.getAdjusted = function(block: any, atId: string, opt_delta?: number, opt_negate?: boolean, opt_order?: number) {
  let delta = opt_delta || 0;
  let order = opt_order || (Blockly as any).PSeInt.ORDER_NONE;
  let defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';

  let innerOrder;
  let outerOrder = order;
  if (delta > 0) {
    outerOrder = (Blockly as any).PSeInt.ORDER_ADDITION;
    innerOrder = (Blockly as any).PSeInt.ORDER_ADDITION;
  } else if (delta < 0) {
    delta = -delta;
    outerOrder = (Blockly as any).PSeInt.ORDER_SUBTRACTION;
    innerOrder = (Blockly as any).PSeInt.ORDER_SUBTRACTION;
  } else if (opt_negate) {
    outerOrder = (Blockly as any).PSeInt.ORDER_UNARY_NEGATION;
    innerOrder = (Blockly as any).PSeInt.ORDER_UNARY_NEGATION;
  }

  let at = (Blockly as any).PSeInt.valueToCode(block, atId, innerOrder) || defaultAtIndex;

  if ((Blockly as any).isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = Number(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + ' + ' + delta;
      const isFloatOrInteger = ['math_number', 'math_integer', 'math_whole_number'];
      const isInteger = isFloatOrInteger.includes(block.getInputTargetBlock(atId)?.type || '');
      if (!isInteger) {
        at = 'TRUNC(' + at + ')';
      }
    } else if (delta < 0) {
      at = at + ' - ' + delta;
      const isFloatOrInteger = ['math_number', 'math_integer', 'math_whole_number'];
      const isInteger = isFloatOrInteger.includes(block.getInputTargetBlock(atId)?.type || '');
      if (!isInteger) {
        at = 'TRUNC(' + at + ')';
      }
    }
    if (opt_negate) {
      if (delta) {
        at = '-(' + at + ')';
      } else {
        at = '-' + at;
      }
    }
    innerOrder = Math.floor(innerOrder);
    if (order >= innerOrder) {
      at = '(' + at + ')';
    }
  }
  return at;
};