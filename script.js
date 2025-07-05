
// Estado global de la aplicación
let currentComplaint = {
    text: '',
    category: '',
    formData: {},
    detectedFields: []
};

// Datos de ejemplo para el feed
const sampleComplaints = [
    {
        id: 1,
        author: 'María G.',
        time: '2 horas',
        category: 'Salud',
        location: 'Hospital Municipal',
        content: 'La espera en el hospital municipal es demasiado larga. Llevo 4 horas esperando con mi hijo enfermo y no hay información sobre los tiempos de espera.',
        likes: 47,
        comments: 12,
        supports: 23
    },
    {
        id: 2,
        author: 'Carlos R.',
        time: '5 horas',
        category: 'Transporte',
        location: 'Línea de colectivos',
        content: 'Los colectivos no respetan los horarios. Todos los días llego tarde al trabajo porque no pasan a tiempo y cuando pasan van llenos.',
        likes: 31,
        comments: 8,
        supports: 45
    },
    {
        id: 3,
        author: 'Ana M.',
        time: '1 día',
        category: 'Educación',
        location: 'Escuela primaria',
        content: 'La escuela de mi barrio no tiene calefacción y los chicos están pasando frío en las aulas. Es inadmisible en pleno invierno.',
        likes: 89,
        comments: 23,
        supports: 67
    }
];

// Patrones para detectar tipos de reclamos
const complaintPatterns = {
    salud: {
        keywords: ['hospital', 'médico', 'salud', 'enfermo', 'consulta', 'emergencia', 'guardia', 'tratamiento'],
        fields: ['hospital', 'tipo_problema', 'urgencia', 'ubicacion']
    },
    transporte: {
        keywords: ['colectivo', 'bus', 'transporte', 'horario', 'tren', 'metro', 'taxi', 'viaje'],
        fields: ['linea_transporte', 'tipo_problema', 'horario', 'frecuencia', 'ubicacion']
    },
    educacion: {
        keywords: ['escuela', 'colegio', 'educación', 'maestro', 'profesor', 'aula', 'estudiante'],
        fields: ['institucion', 'tipo_problema', 'grado_nivel', 'ubicacion']
    },
    servicios: {
        keywords: ['agua', 'luz', 'gas', 'internet', 'teléfono', 'basura', 'limpieza'],
        fields: ['tipo_servicio', 'tipo_problema', 'duracion', 'ubicacion']
    },
    seguridad: {
        keywords: ['seguridad', 'robo', 'delito', 'policía', 'iluminación', 'peligro'],
        fields: ['tipo_incidente', 'horario', 'frecuencia', 'ubicacion']
    }
};

// Formularios específicos por categoría
const formTemplates = {
    salud: `
        <div class="form-container active bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Reclamo de Salud</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Hospital/Centro de Salud</label>
                    <input type="text" id="hospital" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Problema</label>
                    <select id="tipo_problema" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option value="espera">Tiempo de espera excesivo</option>
                        <option value="atencion">Mala atención</option>
                        <option value="falta_personal">Falta de personal</option>
                        <option value="equipamiento">Falta de equipamiento</option>
                        <option value="medicamentos">Falta de medicamentos</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nivel de Urgencia</label>
                    <select id="urgencia" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                    <input type="text" id="ubicacion" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
        </div>
    `,
    transporte: `
        <div class="form-container active bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Reclamo de Transporte</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Línea/Servicio</label>
                    <input type="text" id="linea_transporte" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Problema</label>
                    <select id="tipo_problema" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option value="horarios">No respeta horarios</option>
                        <option value="frecuencia">Poca frecuencia</option>
                        <option value="sobrecarga">Vehículos sobrecargados</option>
                        <option value="estado">Mal estado del vehículo</option>
                        <option value="servicio">Mal servicio</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Horario del Problema</label>
                    <input type="text" id="horario" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej: 7-9 AM">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Frecuencia</label>
                    <select id="frecuencia" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option value="diario">Todos los días</option>
                        <option value="frecuente">Varias veces por semana</option>
                        <option value="ocasional">Ocasionalmente</option>
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ubicación/Recorrido</label>
                    <input type="text" id="ubicacion" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
        </div>
    `,
    educacion: `
        <div class="form-container active bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Reclamo Educativo</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Institución</label>
                    <input type="text" id="institucion" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Problema</label>
                    <select id="tipo_problema" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option value="infraestructura">Problemas de infraestructura</option>
                        <option value="falta_docentes">Falta de docentes</option>
                        <option value="materiales">Falta de materiales</option>
                        <option value="calidad">Calidad educativa</option>
                        <option value="seguridad">Seguridad escolar</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nivel Educativo</label>
                    <select id="grado_nivel" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option value="inicial">Inicial</option>
                        <option value="primario">Primario</option>
                        <option value="secundario">Secundario</option>
                        <option value="universitario">Universitario</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                    <input type="text" id="ubicacion" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
        </div>
    `
};

// Funciones principales
function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(sectionName + '-section').style.display = 'block';
    
    // Si es la sección de feed, cargar los reclamos
    if (sectionName === 'feed') {
        loadComplaints();
    }
}

function loadComplaints() {
    const container = document.getElementById('complaints-container');
    container.innerHTML = '';
    
    sampleComplaints.forEach(complaint => {
        const complaintElement = createComplaintElement(complaint);
        container.appendChild(complaintElement);
    });
}

function createComplaintElement(complaint) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow fade-in';
    
    div.innerHTML = `
        <div class="p-6">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        ${complaint.author.charAt(0)}
                    </div>
                    <div>
                        <div class="font-semibold text-gray-800">${complaint.author}</div>
                        <div class="text-sm text-gray-500">${complaint.time} • ${complaint.location}</div>
                    </div>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${complaint.category}
                </span>
            </div>
            
            <p class="text-gray-800 mb-4 leading-relaxed">${complaint.content}</p>
            
            <div class="border-t border-gray-100 pt-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-6">
                        <button class="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                            <span>❤️</span>
                            <span class="text-sm font-medium">${complaint.likes}</span>
                        </button>
                        <button class="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                            <span>💬</span>
                            <span class="text-sm font-medium">${complaint.comments}</span>
                        </button>
                        <button class="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                            <span>✊</span>
                            <span class="text-sm font-medium">${complaint.supports}</span>
                        </button>
                    </div>
                    <button class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
                        Me sumo →
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return div;
}

function processText() {
    const text = document.getElementById('free-text').value.toLowerCase();
    currentComplaint.text = text;
    
    if (text.length < 10) {
        document.getElementById('dynamic-forms').innerHTML = '';
        document.getElementById('submit-btn').disabled = true;
        return;
    }
    
    // Detectar categoría basada en palabras clave
    let detectedCategory = '';
    let maxMatches = 0;
    
    for (const [category, config] of Object.entries(complaintPatterns)) {
        const matches = config.keywords.filter(keyword => text.includes(keyword)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            detectedCategory = category;
        }
    }
    
    if (detectedCategory && formTemplates[detectedCategory]) {
        showDynamicForm(detectedCategory);
        extractDataFromText(text, detectedCategory);
        document.getElementById('submit-btn').disabled = false;
    } else {
        // Formulario genérico si no se detecta categoría específica
        showGenericForm();
        document.getElementById('submit-btn').disabled = false;
    }
}

function showDynamicForm(category) {
    const container = document.getElementById('dynamic-forms');
    container.innerHTML = formTemplates[category];
    container.classList.add('fade-in');
    currentComplaint.category = category;
}

function showGenericForm() {
    const container = document.getElementById('dynamic-forms');
    container.innerHTML = `
        <div class="form-container active bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Información del Reclamo</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    <select id="categoria" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Seleccionar...</option>
                        <option value="salud">Salud</option>
                        <option value="transporte">Transporte</option>
                        <option value="educacion">Educación</option>
                        <option value="servicios">Servicios Públicos</option>
                        <option value="seguridad">Seguridad</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                    <input type="text" id="ubicacion" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Problema Principal</label>
                    <input type="text" id="problema" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>
            </div>
        </div>
    `;
    currentComplaint.category = 'generico';
}

function extractDataFromText(text, category) {
    // Simulación simple de extracción de datos del texto libre
    // En una implementación real, esto sería más sofisticado
    
    // Buscar ubicaciones comunes
    const locations = ['hospital', 'escuela', 'colectivo', 'línea', 'centro de salud'];
    locations.forEach(loc => {
        if (text.includes(loc)) {
            const locationField = document.getElementById('ubicacion');
            if (locationField && !locationField.value) {
                locationField.value = loc;
            }
        }
    });
    
    // Autocompletar algunos campos basados en el texto
    if (category === 'salud') {
        if (text.includes('espera') || text.includes('tiempo')) {
            const problemField = document.getElementById('tipo_problema');
            if (problemField) problemField.value = 'espera';
        }
    }
    
    if (category === 'transporte') {
        if (text.includes('horario') || text.includes('tarde')) {
            const problemField = document.getElementById('tipo_problema');
            if (problemField) problemField.value = 'horarios';
        }
    }
}

function submitComplaint() {
    // Recopilar datos del formulario
    const formData = {};
    const form = document.querySelector('.form-container.active');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.value) {
                formData[input.id] = input.value;
            }
        });
    }
    
    currentComplaint.formData = formData;
    
    // Simular envío
    alert('¡Reclamo enviado exitosamente! Será revisado y publicado pronto.');
    
    // Limpiar formulario
    document.getElementById('free-text').value = '';
    document.getElementById('dynamic-forms').innerHTML = '';
    document.getElementById('submit-btn').disabled = true;
    
    // Volver al feed
    showSection('feed');
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    loadComplaints();
});
