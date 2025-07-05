
// Estado global de la aplicación
let appState = {
    activeTab: 'feed',
    complaints: [
        {
            id: 1,
            author: 'María García',
            time: '2 horas',
            category: 'Salud',
            location: 'Hospital Municipal de Palermo',
            content: 'La espera en el hospital municipal es demasiado larga. Llevo 4 horas esperando con mi hijo enfermo y no hay información sobre los tiempos de espera. Necesitamos mayor transparencia en los procesos.',
            likes: 47,
            comments: 12,
            supports: 23,
            entities: ['Hospital Municipal de Palermo', 'transparencia']
        },
        {
            id: 2,
            author: 'Carlos Rodriguez',
            time: '5 horas',
            category: 'Transporte',
            location: 'Línea 60 - Constitución',
            content: 'Los colectivos de la línea 60 no respetan los horarios establecidos. Todos los días llego tarde al trabajo porque no pasan a tiempo y cuando pasan van llenos. Esta situación afecta mi productividad laboral.',
            likes: 31,
            comments: 8,
            supports: 45,
            entities: ['línea 60', 'Constitución', 'horarios']
        },
        {
            id: 3,
            author: 'Ana Martínez',
            time: '1 día',
            category: 'Educación',
            location: 'Escuela Primaria N°15',
            content: 'La Escuela Primaria N°15 de mi barrio no tiene calefacción funcionando y los chicos están pasando frío en las aulas. Es inadmisible en pleno invierno que no se garanticen condiciones básicas.',
            likes: 89,
            comments: 23,
            supports: 67,
            entities: ['Escuela Primaria N°15', 'calefacción']
        }
    ],
    formData: {},
    detectedEntities: [],
    connectedData: {}
};

// Patrones para detectar categorías automáticamente
const categoryPatterns = {
    salud: {
        keywords: ['hospital', 'médico', 'salud', 'enfermo', 'consulta', 'emergencia', 'guardia', 'tratamiento'],
        color: 'bg-red-100 text-red-800'
    },
    transporte: {
        keywords: ['colectivo', 'bus', 'transporte', 'horario', 'tren', 'metro', 'taxi', 'línea'],
        color: 'bg-blue-100 text-blue-800'
    },
    educacion: {
        keywords: ['escuela', 'colegio', 'educación', 'maestro', 'profesor', 'aula', 'estudiante'],
        color: 'bg-green-100 text-green-800'
    },
    servicios: {
        keywords: ['agua', 'luz', 'gas', 'internet', 'teléfono', 'basura', 'limpieza'],
        color: 'bg-yellow-100 text-yellow-800'
    },
    seguridad: {
        keywords: ['seguridad', 'robo', 'delito', 'policía', 'iluminación', 'peligro'],
        color: 'bg-purple-100 text-purple-800'
    }
};

// Entidades conocidas para resaltar
const knownEntities = [
    'Hospital Municipal de Palermo', 'línea 60', 'Constitución', 'Escuela Primaria N°15',
    'calefacción', 'transparencia', 'horarios', 'Palermo', 'Hospital Italiano',
    'Universidad de Buenos Aires', 'Policía Federal', 'CABA', 'Buenos Aires'
];

// Datos públicos simulados
const publicData = {
    'Hospital Municipal de Palermo': {
        presupuesto: '$2.5M',
        personal: '150 empleados',
        tiempoEspera: '3.2 horas promedio',
        director: 'Dr. Juan Pérez'
    },
    'línea 60': {
        frecuencia: '15 minutos',
        flota: '45 unidades',
        recorrido: 'Constitución - Tigre',
        empresa: 'Transporte Sur SA'
    },
    'Escuela Primaria N°15': {
        matricula: '320 estudiantes',
        docentes: '18 maestros',
        infraestructura: 'Necesita renovación',
        director: 'Prof. María López'
    }
};

// Componente Header
function createHeader() {
    return `
        <header class="bg-white shadow-md border-b border-gray-200">
            <div class="container mx-auto px-4">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center space-x-4">
                        <div class="bg-gradient-to-r from-orange-500 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-xl">P</span>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-800">Plataforma Ciudadana</h1>
                            <p class="text-xs text-gray-500">Transparencia y participación</p>
                        </div>
                    </div>

                    <div class="hidden md:flex flex-1 max-w-lg mx-8">
                        <div class="relative w-full">
                            <input
                                type="text"
                                placeholder="Buscar reclamos, entidades, patrones..."
                                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-gray-50"
                            />
                            <div class="absolute left-3 top-2.5">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center space-x-4">
                        <button class="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5l-5-5h5v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5z"></path>
                            </svg>
                            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                3
                            </span>
                        </button>

                        <div class="flex items-center space-x-3">
                            <div class="hidden md:block text-right">
                                <p class="text-sm font-medium text-gray-800">Juan Pérez</p>
                                <p class="text-xs text-gray-500">Ciudadano Activo</p>
                            </div>
                            <div class="bg-gradient-to-r from-orange-400 to-blue-500 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    `;
}

// Componente para crear nuevo reclamo
function createComplaintForm() {
    return `
        <div class="max-w-4xl mx-auto">
            <div class="mb-8 text-center">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Crear Nuevo Reclamo</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">
                    Expresa tu reclamo y ayuda a conectar datos públicos para revelar patrones y promover la transparencia ciudadana
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <label class="block text-sm font-medium text-gray-700 mb-3">
                            Describe tu reclamo
                        </label>
                        <textarea 
                            id="complaintText"
                            placeholder="Ejemplo: En el Hospital Italiano de Buenos Aires, los tiempos de espera son excesivos y no hay transparencia en la asignación de turnos..."
                            class="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            oninput="handleTextInput(this.value)"
                        ></textarea>
                        <p class="text-xs text-gray-500 mt-2">
                            Las entidades detectadas aparecerán resaltadas automáticamente
                        </p>
                    </div>

                    <div id="processedText" class="bg-white rounded-lg shadow-md p-6 hidden">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Texto Procesado con Entidades</h3>
                        <div id="highlightedContent" class="prose max-w-none"></div>
                    </div>

                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Información Adicional</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                                <select id="categorySelect" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                    <option value="">Detectar automáticamente...</option>
                                    <option value="salud">Salud</option>
                                    <option value="transporte">Transporte</option>
                                    <option value="educacion">Educación</option>
                                    <option value="servicios">Servicios Públicos</option>
                                    <option value="seguridad">Seguridad</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Ubicación Principal</label>
                                <input 
                                    type="text" 
                                    id="locationInput"
                                    placeholder="Se detectará automáticamente..."
                                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nivel de Urgencia</label>
                                <select class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                    <option value="baja">Baja</option>
                                    <option value="media">Media</option>
                                    <option value="alta">Alta</option>
                                    <option value="critica">Crítica</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Impacto</label>
                                <select class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                    <option value="personal">Personal</option>
                                    <option value="comunitario">Comunitario</option>
                                    <option value="sectorial">Sectorial</option>
                                    <option value="sistemico">Sistémico</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="flex space-x-4">
                        <button 
                            onclick="submitComplaint()"
                            class="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Publicar Reclamo
                        </button>
                        <button class="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                            Guardar Borrador
                        </button>
                    </div>
                </div>

                <div class="lg:col-span-1">
                    <div class="sticky top-4 space-y-6">
                        <div id="entityPanel" class="bg-white rounded-lg shadow-md p-6 hidden">
                            <h3 class="text-lg font-semibold mb-4 text-gray-800">Entidades Detectadas</h3>
                            <div id="entityList" class="space-y-3"></div>
                        </div>

                        <div id="dataPanel" class="bg-white rounded-lg shadow-md p-6 hidden">
                            <h3 class="text-lg font-semibold mb-4 text-gray-800">Datos Públicos Conectados</h3>
                            <div id="dataContent" class="space-y-4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Componente feed de reclamos
function createComplaintFeed() {
    const complaintsHtml = appState.complaints.map(complaint => `
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-all fade-in">
            <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-r from-orange-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            ${complaint.author.charAt(0)}
                        </div>
                        <div>
                            <div class="font-semibold text-gray-800">${complaint.author}</div>
                            <div class="text-sm text-gray-500">${complaint.time} • ${complaint.location}</div>
                        </div>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(complaint.category)}">
                        ${complaint.category}
                    </span>
                </div>
                
                <div class="mb-4">
                    ${highlightEntities(complaint.content, complaint.entities)}
                </div>
                
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
                                <span>🤝</span>
                                <span class="text-sm font-medium">${complaint.supports}</span>
                            </button>
                        </div>
                        <button class="text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors">
                            Ver Análisis →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    return `
        <div>
            <div class="mb-8 text-center">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Reclamos y Análisis</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">
                    Explora reclamos ciudadanos con datos públicos conectados y patrones detectados automáticamente
                </p>
            </div>

            <div class="mb-6 flex flex-wrap gap-2">
                <button class="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors">
                    Todos los reclamos
                </button>
                <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                    Salud
                </button>
                <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                    Transporte
                </button>
                <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                    Educación
                </button>
                <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                    Con datos conectados
                </button>
            </div>

            <div class="grid gap-6 max-w-4xl mx-auto">
                ${complaintsHtml}
            </div>

            <div class="text-center mt-8">
                <button class="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                    Cargar más reclamos
                </button>
            </div>
        </div>
    `;
}

// Componente dashboard de estadísticas
function createStatsDashboard() {
    return `
        <div class="max-w-6xl mx-auto">
            <div class="mb-8 text-center">
                <h2 class="text-3xl font-bold text-gray-800 mb-4">Dashboard de Análisis</h2>
                <p class="text-gray-600 max-w-2xl mx-auto">
                    Visualiza patrones, tendencias y conexiones de datos en tiempo real
                </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="text-3xl font-bold text-orange-600">1,247</div>
                        <div class="ml-auto text-green-500">↗️ 12%</div>
                    </div>
                    <div class="text-sm text-gray-600 mt-2">Reclamos Totales</div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="text-3xl font-bold text-blue-600">89</div>
                        <div class="ml-auto text-green-500">↗️ 8%</div>
                    </div>
                    <div class="text-sm text-gray-600 mt-2">Entidades Conectadas</div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="text-3xl font-bold text-green-600">456</div>
                        <div class="ml-auto text-green-500">↗️ 15%</div>
                    </div>
                    <div class="text-sm text-gray-600 mt-2">Patrones Detectados</div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="text-3xl font-bold text-purple-600">78%</div>
                        <div class="ml-auto text-green-500">↗️ 5%</div>
                    </div>
                    <div class="text-sm text-gray-600 mt-2">Precisión del Sistema</div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800">Categorías más Reportadas</h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700">Salud</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-32 bg-gray-200 rounded-full h-2">
                                    <div class="bg-red-500 h-2 rounded-full" style="width: 75%"></div>
                                </div>
                                <span class="text-sm text-gray-500">342</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700">Transporte</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-32 bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-500 h-2 rounded-full" style="width: 60%"></div>
                                </div>
                                <span class="text-sm text-gray-500">267</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700">Educación</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-32 bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full" style="width: 45%"></div>
                                </div>
                                <span class="text-sm text-gray-500">198</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-gray-700">Servicios</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-32 bg-gray-200 rounded-full h-2">
                                    <div class="bg-yellow-500 h-2 rounded-full" style="width: 30%"></div>
                                </div>
                                <span class="text-sm text-gray-500">134</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-lg font-semibold mb-4 text-gray-800">Entidades más Mencionadas</h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                            <span class="font-medium text-gray-800">Hospital Municipal de Palermo</span>
                            <span class="text-sm bg-orange-100 text-orange-800 px-2 py-1 rounded-full">23 menciones</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span class="font-medium text-gray-800">Línea 60 - Constitución</span>
                            <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">18 menciones</span>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span class="font-medium text-gray-800">Universidad de Buenos Aires</span>
                            <span class="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">15 menciones</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold mb-4 text-gray-800">Mapa de Calor de Reclamos</h3>
                <div class="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                    <p class="text-gray-500">Visualización interactiva del mapa de calor</p>
                </div>
            </div>
        </div>
    `;
}

// Funciones auxiliares
function getCategoryColor(category) {
    const colors = {
        'Salud': 'bg-red-100 text-red-800',
        'Transporte': 'bg-blue-100 text-blue-800',
        'Educación': 'bg-green-100 text-green-800',
        'Servicios': 'bg-yellow-100 text-yellow-800',
        'Seguridad': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
}

function highlightEntities(text, entities) {
    let highlightedText = text;
    entities.forEach(entity => {
        const regex = new RegExp(`(${entity})`, 'gi');
        highlightedText = highlightedText.replace(regex, `<span class="entity-highlight" onclick="showEntityInfo('${entity}')">$1</span>`);
    });
    return highlightedText;
}

function detectEntities(text) {
    const detected = [];
    knownEntities.forEach(entity => {
        if (text.toLowerCase().includes(entity.toLowerCase())) {
            detected.push(entity);
        }
    });
    return detected;
}

function detectCategory(text) {
    const lowerText = text.toLowerCase();
    let bestMatch = '';
    let maxMatches = 0;

    for (const [category, config] of Object.entries(categoryPatterns)) {
        const matches = config.keywords.filter(keyword => lowerText.includes(keyword)).length;
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatch = category;
        }
    }

    return bestMatch;
}

// Manejadores de eventos
function handleTextInput(text) {
    if (text.length < 10) {
        document.getElementById('processedText').classList.add('hidden');
        document.getElementById('entityPanel').classList.add('hidden');
        document.getElementById('dataPanel').classList.add('hidden');
        return;
    }

    // Detectar entidades
    const entities = detectEntities(text);
    appState.detectedEntities = entities;

    // Mostrar texto procesado
    if (entities.length > 0) {
        document.getElementById('processedText').classList.remove('hidden');
        document.getElementById('highlightedContent').innerHTML = highlightEntities(text, entities);
    }

    // Detectar categoría automáticamente
    const category = detectCategory(text);
    if (category) {
        document.getElementById('categorySelect').value = category;
    }

    // Mostrar panel de entidades
    if (entities.length > 0) {
        document.getElementById('entityPanel').classList.remove('hidden');
        const entityList = document.getElementById('entityList');
        entityList.innerHTML = entities.map(entity => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="font-medium text-gray-800">${entity}</span>
                <button onclick="showEntityInfo('${entity}')" class="text-sm text-orange-600 hover:text-orange-800">
                    Ver datos
                </button>
            </div>
        `).join('');
    }

    // Mostrar datos públicos conectados
    const connectedEntities = entities.filter(entity => publicData[entity]);
    if (connectedEntities.length > 0) {
        document.getElementById('dataPanel').classList.remove('hidden');
        const dataContent = document.getElementById('dataContent');
        dataContent.innerHTML = connectedEntities.map(entity => {
            const data = publicData[entity];
            return `
                <div class="border border-gray-200 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-800 mb-2">${entity}</h4>
                    <div class="space-y-1 text-sm text-gray-600">
                        ${Object.entries(data).map(([key, value]) => 
                            `<div><span class="font-medium">${key}:</span> ${value}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
}

function showEntityInfo(entity) {
    const data = publicData[entity];
    if (data) {
        alert(`Información de ${entity}:\n\n${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join('\n')}`);
    } else {
        alert(`${entity} - Entidad detectada pero sin datos públicos conectados aún.`);
    }
}

function submitComplaint() {
    const text = document.getElementById('complaintText').value;
    if (!text.trim()) {
        alert('Por favor, describe tu reclamo.');
        return;
    }

    alert('¡Reclamo enviado exitosamente! Se ha procesado y conectado con datos públicos disponibles.');
    
    // Limpiar formulario
    document.getElementById('complaintText').value = '';
    document.getElementById('processedText').classList.add('hidden');
    document.getElementById('entityPanel').classList.add('hidden');
    document.getElementById('dataPanel').classList.add('hidden');
    
    // Cambiar a feed
    setActiveTab('feed');
}

function setActiveTab(tab) {
    appState.activeTab = tab;
    renderApp();
}

function renderApp() {
    const root = document.getElementById('root');
    
    let content = '';
    switch (appState.activeTab) {
        case 'create':
            content = createComplaintForm();
            break;
        case 'stats':
            content = createStatsDashboard();
            break;
        case 'feed':
        default:
            content = createComplaintFeed();
            break;
    }

    root.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
            ${createHeader()}
            
            <div class="bg-gradient-to-r from-orange-500 to-blue-600 text-white py-16">
                <div class="container mx-auto px-4">
                    <div class="text-center max-w-4xl mx-auto">
                        <h1 class="text-5xl font-bold mb-6">
                            Plataforma Ciudadana de Reclamos
                        </h1>
                        <p class="text-xl mb-8 opacity-90">
                            Conectamos tus reclamos con datos públicos para revelar patrones, 
                            promover la transparencia y generar un impacto real en tu comunidad.
                        </p>
                        <div class="flex justify-center gap-4">
                            <button 
                                onclick="setActiveTab('create')"
                                class="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all transform hover:scale-105"
                            >
                                Crear Reclamo
                            </button>
                            <button 
                                onclick="setActiveTab('feed')"
                                class="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all"
                            >
                                Explorar Reclamos
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white shadow-sm border-b">
                <div class="container mx-auto px-4">
                    <nav class="flex space-x-8">
                        <button
                            onclick="setActiveTab('feed')"
                            class="flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                appState.activeTab === 'feed'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }"
                        >
                            <span>📢</span>
                            <span>Feed de Reclamos</span>
                        </button>
                        <button
                            onclick="setActiveTab('create')"
                            class="flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                appState.activeTab === 'create'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }"
                        >
                            <span>✍️</span>
                            <span>Crear Reclamo</span>
                        </button>
                        <button
                            onclick="setActiveTab('stats')"
                            class="flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                appState.activeTab === 'stats'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }"
                        >
                            <span>📊</span>
                            <span>Dashboard</span>
                        </button>
                    </nav>
                </div>
            </div>

            <div class="container mx-auto px-4 py-8">
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div class="lg:col-span-3">
                        ${content}
                    </div>

                    <div class="lg:col-span-1">
                        <div class="sticky top-4 space-y-6">
                            <div class="bg-white rounded-lg shadow-md p-6">
                                <h3 class="text-lg font-semibold mb-4 text-gray-800">Estadísticas en Vivo</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Reclamos Hoy</span>
                                        <span class="font-bold text-orange-600">147</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Entidades Conectadas</span>
                                        <span class="font-bold text-blue-600">89</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Patrones Detectados</span>
                                        <span class="font-bold text-green-600">234</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Impacto Generado</span>
                                        <span class="font-bold text-purple-600">1,234</span>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-white rounded-lg shadow-md p-6">
                                <h3 class="text-lg font-semibold mb-4 text-gray-800">Trending</h3>
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center">
                                        <span class="text-orange-600 hover:text-orange-800 cursor-pointer font-medium">
                                            #HospitalPalermo
                                        </span>
                                        <span class="bg-gray-100 px-2 py-1 rounded-full text-xs">45</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-orange-600 hover:text-orange-800 cursor-pointer font-medium">
                                            #TransportePublico
                                        </span>
                                        <span class="bg-gray-100 px-2 py-1 rounded-full text-xs">32</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-orange-600 hover:text-orange-800 cursor-pointer font-medium">
                                            #EducacionBA
                                        </span>
                                        <span class="bg-gray-100 px-2 py-1 rounded-full text-xs">28</span>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg shadow-md p-6">
                                <h3 class="text-lg font-semibold mb-4 text-gray-800">Tu Actividad</h3>
                                <div class="text-center">
                                    <div class="text-3xl font-bold text-orange-600 mb-2">1,247</div>
                                    <div class="text-sm text-gray-600 mb-4">Puntos de Impacto</div>
                                    <div class="bg-white rounded-full p-1">
                                        <div class="bg-gradient-to-r from-orange-400 to-blue-500 h-2 rounded-full" style="width: 67%"></div>
                                    </div>
                                    <div class="text-xs text-gray-500 mt-2">Próximo nivel: 500 puntos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    renderApp();
});
