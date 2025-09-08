/**
 * @fileoverview Block definitions for PSeInt language constructs.
 */

// Program structure block
(Blockly as any).Blocks['pseint_program'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Proceso")
        .appendField(new (Blockly as any).FieldTextInput("SinTitulo"), "NAME");
    this.appendStatementInput("STATEMENTS")
        .setCheck(null);
    this.appendDummyInput()
        .appendField("FinProceso");
    this.setColour(120);
    this.setTooltip("Define un programa PSeInt");
    this.setHelpUrl("");
  }
};

// Assignment block
(Blockly as any).Blocks['pseint_assign'] = {
  init: function() {
    this.appendValueInput("VALUE")
        .setCheck(null)
        .appendField(new (Blockly as any).FieldVariable("var"), "VAR")
        .appendField("<-");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("Asigna un valor a una variable");
    this.setHelpUrl("");
  }
};

// Read input block
(Blockly as any).Blocks['pseint_read'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Leer")
        .appendField(new (Blockly as any).FieldVariable("var"), "VAR0");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Lee valores del usuario");
    this.setHelpUrl("");
    this.itemCount_ = 1;
    this.setMutator(new (Blockly as any).Mutator(['pseint_read_item']));
  },
  
  mutationToDom: function() {
    const container = (Blockly as any).utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  
  domToMutation: function(xmlElement: any) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10) || 1;
    this.updateShape_();
  },
  
  decompose: function(workspace: any) {
    const containerBlock = workspace.newBlock('pseint_read_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock('pseint_read_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  
  compose: function(containerBlock: any) {
    let itemBlock = containerBlock.getInputTargetBlock('STACK');
    const connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput('VAR' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    for (let i = 0; i < this.itemCount_; i++) {
      if (connections[i]) {
        this.getInput('VAR' + i).connection.connect(connections[i]);
      }
    }
  },
  
  updateShape_: function() {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY')
          .appendField("Leer (vacío)");
    }
    
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('VAR' + i)) {
        const input = this.appendDummyInput('VAR' + i);
        if (i === 0) {
          input.appendField("Leer");
        } else {
          input.appendField(",");
        }
        input.appendField(new (Blockly as any).FieldVariable("var"), "VAR" + i);
      }
    }
    
    while (this.getInput('VAR' + this.itemCount_)) {
      this.removeInput('VAR' + this.itemCount_);
      this.itemCount_++;
    }
  }
};

// Write output block
(Blockly as any).Blocks['pseint_write'] = {
  init: function() {
    this.appendValueInput("EXPR0")
        .setCheck(null)
        .appendField("Escribir");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Muestra valores al usuario");
    this.setHelpUrl("");
    this.itemCount_ = 1;
    this.setMutator(new (Blockly as any).Mutator(['pseint_write_item']));
  },
  
  mutationToDom: function() {
    const container = (Blockly as any).utils.xml.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  
  domToMutation: function(xmlElement: any) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10) || 1;
    this.updateShape_();
  },
  
  decompose: function(workspace: any) {
    const containerBlock = workspace.newBlock('pseint_write_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.itemCount_; i++) {
      const itemBlock = workspace.newBlock('pseint_write_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  
  compose: function(containerBlock: any) {
    let itemBlock = containerBlock.getInputTargetBlock('STACK');
    const connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    for (let i = 0; i < this.itemCount_; i++) {
      const connection = this.getInput('EXPR' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) === -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    for (let i = 0; i < this.itemCount_; i++) {
      if (connections[i]) {
        this.getInput('EXPR' + i).connection.connect(connections[i]);
      }
    }
  },
  
  updateShape_: function() {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY')
          .appendField("Escribir (vacío)");
    }
    
    for (let i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('EXPR' + i)) {
        const input = this.appendValueInput('EXPR' + i)
            .setCheck(null);
        if (i === 0) {
          input.appendField("Escribir");
        } else {
          input.appendField(",");
        }
      }
    }
    
    while (this.getInput('EXPR' + this.itemCount_)) {
      this.removeInput('EXPR' + this.itemCount_);
      this.itemCount_++;
    }
  }
};

// Dimension block
(Blockly as any).Blocks['pseint_dimension'] = {
  init: function() {
    this.appendValueInput("SIZE")
        .setCheck("Number")
        .appendField("Dimension")
        .appendField(new (Blockly as any).FieldVariable("arreglo"), "VAR")
        .appendField("[");
    this.appendDummyInput()
        .appendField("]");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("Define un arreglo");
    this.setHelpUrl("");
  }
};

// Helper blocks for mutators
(Blockly as any).Blocks['pseint_read_container'] = {
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField("Leer");
    this.appendStatementInput('STACK');
    this.setTooltip("Contenedor para variables de lectura");
    this.contextMenu = false;
  }
};

(Blockly as any).Blocks['pseint_read_item'] = {
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField("variable");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Variable para leer");
    this.contextMenu = false;
  }
};

(Blockly as any).Blocks['pseint_write_container'] = {
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField("Escribir");
    this.appendStatementInput('STACK');
    this.setTooltip("Contenedor para expresiones de escritura");
    this.contextMenu = false;
  }
};

(Blockly as any).Blocks['pseint_write_item'] = {
  init: function() {
    this.setColour(160);
    this.appendDummyInput()
        .appendField("expresión");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip("Expresión para escribir");
    this.contextMenu = false;
  }
};