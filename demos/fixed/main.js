// Initialize Blockly workspace
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: document.getElementById('toolbox'),
  collapse: true,
  comments: true,
  disable: true,
  maxBlocks: Infinity,
  trashcan: true,
  horizontalLayout: false,
  toolboxPosition: 'start',
  css: true,
  media: 'https://unpkg.com/blockly/media/',
  rtl: false,
  scrollbars: true,
  sounds: true,
  oneBasedIndex: true,
  grid: {
    spacing: 20,
    length: 1,
    colour: '#ccc',
    snap: true
  },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2
  },
  theme: Blockly.Themes.Modern
});

// Define PSeInt generator
Blockly.PSeInt = new Blockly.Generator('PSeInt');

// PSeInt code generators
Blockly.PSeInt['pseint_program'] = function(block) {
  const programName = block.getFieldValue('NAME') || 'SinTitulo';
  const statements = Blockly.PSeInt.statementToCode(block, 'STATEMENTS');
  return `Proceso ${programName}\n${statements}FinProceso`;
};

Blockly.PSeInt['variables_set'] = function(block) {
  const variable = Blockly.PSeInt.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  const value = Blockly.PSeInt.valueToCode(block, 'VALUE', Blockly.PSeInt.ORDER_ASSIGNMENT) || '0';
  return variable + ' <- ' + value + ';\n';
};

Blockly.PSeInt['variables_get'] = function(block) {
  const code = Blockly.PSeInt.nameDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return [code, Blockly.PSeInt.ORDER_ATOMIC];
};

Blockly.PSeInt['math_number'] = function(block) {
  const code = Number(block.getFieldValue('NUM'));
  return [code, Blockly.PSeInt.ORDER_ATOMIC];
};

Blockly.PSeInt['text'] = function(block) {
  const code = '"' + block.getFieldValue('TEXT') + '"';
  return [code, Blockly.PSeInt.ORDER_ATOMIC];
};

Blockly.PSeInt['controls_if'] = function(block) {
  const condition = Blockly.PSeInt.valueToCode(block, 'IF0', Blockly.PSeInt.ORDER_NONE) || 'Falso';
  const branch = Blockly.PSeInt.statementToCode(block, 'DO0');
  return 'Si ' + condition + ' Entonces\n' + branch + 'FinSi\n';
};

// Generate PSeInt code
function generateCode() {
  try {
    const code = Blockly.PSeInt.workspaceToCode(workspace);
    const codeElement = document.getElementById('code');
    if (code.trim()) {
      codeElement.textContent = code;
    } else {
      codeElement.textContent = '// Arrastra el bloque "Proceso" para comenzar\n// y añade bloques dentro para crear tu programa';
    }
  } catch (error) {
    console.error('Error generando código:', error);
    document.getElementById('code').textContent = 'Error generando código: ' + error;
  }
}

function runCode() {
  const code = Blockly.PSeInt.workspaceToCode(workspace);
  console.log('=== CÓDIGO PSEINT GENERADO ===');
  console.log(code);
  console.log('===============================');
  alert('📋 Código copiado a la consola del navegador');
}

function clearWorkspace() {
  if (confirm('¿Estás seguro de que quieres limpiar todo el espacio de trabajo?')) {
    workspace.clear();
    generateCode();
  }
}

function loadExample() {
  workspace.clear();
  // Add a simple example
  generateCode();
}

// Make functions globally available
window.generateCode = generateCode;
window.runCode = runCode;
window.clearWorkspace = clearWorkspace;
window.loadExample = loadExample;

// Auto-generate code when workspace changes
workspace.addChangeListener(generateCode);

// Auto-resize
function onResize() {
  const blocklyArea = document.getElementById('blocklyArea');
  const blocklyDiv = document.getElementById('blocklyDiv');
  Blockly.svgResize(workspace);
}

window.addEventListener('resize', onResize, false);
onResize();
generateCode();