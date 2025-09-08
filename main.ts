import './generators/pseint';
import './blocks/pseint_blocks';

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
    colour: '#888',
    snap: true
  },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2
  }
});

// Generate PSeInt code
function generateCode() {
  const code = (Blockly as any).PSeInt.workspaceToCode(workspace);
  document.getElementById('code')!.textContent = code;
}

function runCode() {
  const code = (Blockly as any).PSeInt.workspaceToCode(workspace);
  console.log('PSeInt Code:', code);
  alert('Código generado en la consola del navegador');
}

// Make functions globally available
(window as any).generateCode = generateCode;
(window as any).runCode = runCode;

// Add program structure by default
workspace.addChangeListener(() => {
  generateCode();
});

// Auto-resize
function onResize() {
  const blocklyArea = document.getElementById('blocklyArea')!;
  const blocklyDiv = document.getElementById('blocklyDiv')!;
  const element = blocklyArea;
  let x = 0;
  let y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent as HTMLElement;
  } while (element);
  
  blocklyDiv.style.left = x + 'px';
  blocklyDiv.style.top = y + 'px';
  blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
  blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
  Blockly.svgResize(workspace);
}

window.addEventListener('resize', onResize, false);
onResize();