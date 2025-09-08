import '../../generators/pseint';
import '../../blocks/pseint_blocks';

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

// Generate PSeInt code
function generateCode() {
  try {
    const code = (Blockly as any).PSeInt.workspaceToCode(workspace);
    const codeElement = document.getElementById('code')!;
    if (code.trim()) {
      codeElement.textContent = code;
    } else {
      codeElement.textContent = '// Arrastra el bloque "Proceso" para comenzar\n// y añade bloques dentro para crear tu programa';
    }
  } catch (error) {
    console.error('Error generando código:', error);
    document.getElementById('code')!.textContent = 'Error generando código: ' + error;
  }
}

function runCode() {
  const code = (Blockly as any).PSeInt.workspaceToCode(workspace);
  console.log('=== CÓDIGO PSEINT GENERADO ===');
  console.log(code);
  console.log('===============================');
  alert('📋 Código copiado a la consola del navegador\n\nPresiona F12 para ver la consola y el código generado.');
}

function clearWorkspace() {
  if (confirm('¿Estás seguro de que quieres limpiar todo el espacio de trabajo?')) {
    workspace.clear();
    generateCode();
  }
}

function loadExample() {
  // Clear workspace first
  workspace.clear();
  
  // Create example program
  const xml = `<xml xmlns="https://developers.google.com/blockly/xml">
    <block type="pseint_program" id="main_program" x="50" y="50">
      <field name="NAME">CalcularPromedio</field>
      <statement name="STATEMENTS">
        <block type="variables_set" id="init_suma">
          <field name="VAR">suma</field>
          <value name="VALUE">
            <block type="math_number">
              <field name="NUM">0</field>
            </block>
          </value>
          <next>
            <block type="pseint_write" id="msg_inicio">
              <value name="EXPR0">
                <block type="text">
                  <field name="TEXT">Ingrese 3 números para calcular el promedio:</field>
                </block>
              </value>
              <next>
                <block type="controls_for" id="loop_input">
                  <field name="VAR">i</field>
                  <value name="FROM">
                    <block type="math_number">
                      <field name="NUM">1</field>
                    </block>
                  </value>
                  <value name="TO">
                    <block type="math_number">
                      <field name="NUM">3</field>
                    </block>
                  </value>
                  <value name="BY">
                    <block type="math_number">
                      <field name="NUM">1</field>
                    </block>
                  </value>
                  <statement name="DO">
                    <block type="pseint_read" id="read_num">
                      <field name="VAR0">numero</field>
                      <next>
                        <block type="variables_set" id="add_suma">
                          <field name="VAR">suma</field>
                          <value name="VALUE">
                            <block type="math_arithmetic">
                              <field name="OP">ADD</field>
                              <value name="A">
                                <block type="variables_get">
                                  <field name="VAR">suma</field>
                                </block>
                              </value>
                              <value name="B">
                                <block type="variables_get">
                                  <field name="VAR">numero</field>
                                </block>
                              </value>
                            </block>
                          </value>
                        </block>
                      </next>
                    </block>
                  </statement>
                  <next>
                    <block type="variables_set" id="calc_promedio">
                      <field name="VAR">promedio</field>
                      <value name="VALUE">
                        <block type="math_arithmetic">
                          <field name="OP">DIVIDE</field>
                          <value name="A">
                            <block type="variables_get">
                              <field name="VAR">suma</field>
                            </block>
                          </value>
                          <value name="B">
                            <block type="math_number">
                              <field name="NUM">3</field>
                            </block>
                          </value>
                        </block>
                      </value>
                      <next>
                        <block type="pseint_write" id="show_result">
                          <mutation items="2"></mutation>
                          <value name="EXPR0">
                            <block type="text">
                              <field name="TEXT">El promedio es: </field>
                            </block>
                          </value>
                          <value name="EXPR1">
                            <block type="variables_get">
                              <field name="VAR">promedio</field>
                            </block>
                          </value>
                        </block>
                      </next>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </next>
        </block>
      </statement>
    </block>
  </xml>`;
  
  const dom = Blockly.utils.xml.textToDom(xml);
  Blockly.Xml.domToWorkspace(dom, workspace);
  generateCode();
}

// Make functions globally available
(window as any).generateCode = generateCode;
(window as any).runCode = runCode;
(window as any).clearWorkspace = clearWorkspace;
(window as any).loadExample = loadExample;

// Auto-generate code when workspace changes
workspace.addChangeListener((event: any) => {
  if (event.type === Blockly.Events.BLOCK_CHANGE ||
      event.type === Blockly.Events.BLOCK_CREATE ||
      event.type === Blockly.Events.BLOCK_DELETE ||
      event.type === Blockly.Events.BLOCK_MOVE) {
    generateCode();
  }
});

// Auto-resize
function onResize() {
  const blocklyArea = document.getElementById('blocklyArea')!;
  const blocklyDiv = document.getElementById('blocklyDiv')!;
  const element = blocklyArea;
  let x = 0;
  let y = 0;
  let currentElement = element as HTMLElement;
  do {
    x += currentElement.offsetLeft;
    y += currentElement.offsetTop;
    currentElement = currentElement.offsetParent as HTMLElement;
  } while (currentElement);
  
  blocklyDiv.style.left = x + 'px';
  blocklyDiv.style.top = y + 'px';
  blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
  blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
  Blockly.svgResize(workspace);
}

window.addEventListener('resize', onResize, false);
onResize();

// Initial code generation
generateCode();