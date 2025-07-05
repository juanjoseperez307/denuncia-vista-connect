
const { useState, useEffect } = React;

// Datos de ejemplo para el feed con nombres anónimos
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

// Header Component
const Header = () => {
    return (
        <header className="bg-white shadow-md border-b border-gray-200">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        <div className="bg-gradient-to-r from-orange-500 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">R</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">ReclamosCiudadanos</h1>
                            <p className="text-xs text-gray-500">Tu voz importa</p>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Buscar reclamos, ubicaciones..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-gray-50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-600 hover:text-orange-600 transition-colors">
                            🔔
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                3
                            </span>
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium text-gray-800">Juan P.</p>
                                <p className="text-xs text-gray-500">Ciudadano Activo</p>
                            </div>
                            <div className="bg-gradient-to-r from-orange-400 to-blue-500 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer">
                                👤
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

// ComplaintForm Component
const ComplaintForm = () => {
    const [freeText, setFreeText] = useState('');
    const [detectedCategory, setDetectedCategory] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});

    const processText = (text) => {
        setFreeText(text);
        
        if (text.length < 10) {
            setShowForm(false);
            setDetectedCategory('');
            return;
        }

        const lowerText = text.toLowerCase();
        let category = '';
        let maxMatches = 0;

        for (const [cat, config] of Object.entries(complaintPatterns)) {
            const matches = config.keywords.filter(keyword => lowerText.includes(keyword)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                category = cat;
            }
        }

        if (category) {
            setDetectedCategory(category);
            setShowForm(true);
            extractDataFromText(lowerText, category);
        } else {
            setDetectedCategory('generico');
            setShowForm(true);
        }
    };

    const extractDataFromText = (text, category) => {
        const newFormData = {};
        
        // Extraer ubicaciones básicas
        const locations = ['hospital', 'escuela', 'colectivo', 'línea', 'centro de salud'];
        locations.forEach(loc => {
            if (text.includes(loc)) {
                newFormData.ubicacion = loc;
            }
        });

        // Autocompletar campos específicos
        if (category === 'salud' && (text.includes('espera') || text.includes('tiempo'))) {
            newFormData.tipo_problema = 'espera';
        }
        
        if (category === 'transporte' && (text.includes('horario') || text.includes('tarde'))) {
            newFormData.tipo_problema = 'horarios';
        }

        setFormData(newFormData);
    };

    const renderDynamicForm = () => {
        if (!showForm) return null;

        if (detectedCategory === 'salud') {
            return (
                <div className="bg-white rounded-lg shadow-md p-6 fade-in">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Reclamo de Salud</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hospital/Centro de Salud</label>
                            <input 
                                type="text" 
                                defaultValue={formData.ubicacion || ''}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Problema</label>
                            <select 
                                defaultValue={formData.tipo_problema || ''}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="espera">Tiempo de espera excesivo</option>
                                <option value="atencion">Mala atención</option>
                                <option value="falta_personal">Falta de personal</option>
                                <option value="equipamiento">Falta de equipamiento</option>
                                <option value="medicamentos">Falta de medicamentos</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Urgencia</label>
                            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                <option value="">Seleccionar...</option>
                                <option value="baja">Baja</option>
                                <option value="media">Media</option>
                                <option value="alta">Alta</option>
                                <option value="critica">Crítica</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                            <input 
                                type="text" 
                                defaultValue={formData.ubicacion || ''}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (detectedCategory === 'transporte') {
            return (
                <div className="bg-white rounded-lg shadow-md p-6 fade-in">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Reclamo de Transporte</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Línea/Servicio</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Problema</label>
                            <select 
                                defaultValue={formData.tipo_problema || ''}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Seleccionar...</option>
                                <option value="horarios">No respeta horarios</option>
                                <option value="frecuencia">Poca frecuencia</option>
                                <option value="sobrecarga">Vehículos sobrecargados</option>
                                <option value="estado">Mal estado del vehículo</option>
                                <option value="servicio">Mal servicio</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Horario del Problema</label>
                            <input 
                                type="text" 
                                placeholder="Ej: 7-9 AM"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia</label>
                            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                                <option value="">Seleccionar...</option>
                                <option value="diario">Todos los días</option>
                                <option value="frecuente">Varias veces por semana</option>
                                <option value="ocasional">Ocasionalmente</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación/Recorrido</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        // Formulario genérico
        return (
            <div className="bg-white rounded-lg shadow-md p-6 fade-in">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Reclamo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                        <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Problema Principal</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const submitComplaint = () => {
        alert('¡Reclamo enviado exitosamente! Será revisado y publicado pronto.');
        setFreeText('');
        setShowForm(false);
        setDetectedCategory('');
        setFormData({});
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Hacer un Reclamo</h2>
                <p className="text-gray-600">Describe tu situación y te ayudaremos a estructurar tu reclamo</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cuéntanos qué está pasando
                </label>
                <textarea 
                    value={freeText}
                    onChange={(e) => processText(e.target.value)}
                    placeholder="Escribe libremente sobre tu reclamo... Por ejemplo: 'En el hospital de mi barrio no hay médicos suficientes los fines de semana y la espera es muy larga'"
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                    Mientras escribes, iremos preparando un formulario específico para tu tipo de reclamo
                </p>
            </div>

            {renderDynamicForm()}

            {showForm && (
                <div className="flex space-x-4 mt-6">
                    <button 
                        onClick={submitComplaint}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Publicar Reclamo
                    </button>
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                        Guardar Borrador
                    </button>
                </div>
            )}
        </div>
    );
};

// ComplaintFeed Component
const ComplaintFeed = () => {
    const createComplaintElement = (complaint) => {
        return (
            <div key={complaint.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow fade-in">
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {complaint.author.charAt(0)}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800">{complaint.author}</div>
                                <div className="text-sm text-gray-500">{complaint.time} • {complaint.location}</div>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {complaint.category}
                        </span>
                    </div>
                    
                    <p className="text-gray-800 mb-4 leading-relaxed">{complaint.content}</p>
                    
                    <div className="border-t border-gray-100 pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                                    <span>❤️</span>
                                    <span className="text-sm font-medium">{complaint.likes}</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                                    <span>💬</span>
                                    <span className="text-sm font-medium">{complaint.comments}</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                                    <span>✊</span>
                                    <span className="text-sm font-medium">{complaint.supports}</span>
                                </button>
                            </div>
                            <button className="text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors">
                                Me sumo →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Reclamos Recientes</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Conoce lo que otros ciudadanos están reclamando y súmate a las causas que te importan</p>
            </div>

            <div className="grid gap-6 max-w-4xl mx-auto">
                {sampleComplaints.map(createComplaintElement)}
            </div>

            <div className="text-center mt-8">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                    Ver más reclamos
                </button>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [activeTab, setActiveTab] = useState('feed');

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
            <Header />
            
            <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl font-bold mb-6">
                            Plataforma Ciudadana de Reclamos
                        </h1>
                        <p className="text-xl mb-8 opacity-90">
                            Un espacio para expresar tus reclamos, quejas y protestas. 
                            Tu voz importa para mejorar nuestro sistema.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={() => setActiveTab('create')}
                                className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all transform hover:scale-105"
                            >
                                Crear Reclamo
                            </button>
                            <button 
                                onClick={() => setActiveTab('feed')}
                                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all"
                            >
                                Ver Reclamos
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'feed', label: 'Reclamos Recientes', icon: '📢' },
                            { id: 'create', label: 'Nuevo Reclamo', icon: '✍️' },
                            { id: 'about', label: 'Acerca de', icon: 'ℹ️' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        {activeTab === 'feed' && <ComplaintFeed />}
                        {activeTab === 'create' && <ComplaintForm />}
                        {activeTab === 'about' && (
                            <div className="max-w-3xl mx-auto text-center">
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">Acerca de ReclamosCiudadanos</h2>
                                <div className="bg-white rounded-lg shadow-md p-8">
                                    <p className="text-gray-600 text-lg mb-6">
                                        Somos una plataforma donde los ciudadanos pueden expresar sus reclamos, quejas y protestas sobre servicios públicos y privados.
                                    </p>
                                    <p className="text-gray-600 mb-6">
                                        Creemos que cada voz importa y que juntos podemos generar el cambio que necesitamos para mejorar nuestras comunidades.
                                    </p>
                                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                                        <div className="text-center">
                                            <div className="text-4xl mb-3">📢</div>
                                            <h3 className="font-semibold text-gray-800 mb-2">Tu Voz</h3>
                                            <p className="text-sm text-gray-600">Expresa tus reclamos de forma clara y directa</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-4xl mb-3">🤝</div>
                                            <h3 className="font-semibold text-gray-800 mb-2">Comunidad</h3>
                                            <p className="text-sm text-gray-600">Únete a otros ciudadanos con preocupaciones similares</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-4xl mb-3">✊</div>
                                            <h3 className="font-semibold text-gray-800 mb-2">Acción</h3>
                                            <p className="text-sm text-gray-600">Genera presión para lograr cambios reales</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-4 space-y-6">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Estadísticas Rápidas</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Reclamos Hoy</span>
                                        <span className="font-bold text-orange-600">147</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">En Proceso</span>
                                        <span className="font-bold text-blue-600">89</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Resueltos</span>
                                        <span className="font-bold text-green-600">1,234</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Temas Populares</h3>
                                <div className="space-y-2">
                                    {[
                                        { tag: '#TransportePublico', count: 45 },
                                        { tag: '#Salud', count: 32 },
                                        { tag: '#Seguridad', count: 28 },
                                        { tag: '#Educacion', count: 19 }
                                    ].map((trend) => (
                                        <div key={trend.tag} className="flex justify-between items-center">
                                            <span className="text-orange-600 hover:text-orange-800 cursor-pointer font-medium">
                                                {trend.tag}
                                            </span>
                                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                                {trend.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-orange-100 to-blue-100 rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Tu Actividad</h3>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-600 mb-2">1,247</div>
                                    <div className="text-sm text-gray-600 mb-4">Puntos de Participación</div>
                                    <div className="bg-white rounded-full p-1">
                                        <div className="bg-gradient-to-r from-orange-400 to-blue-500 h-2 rounded-full" style={{width: '67%'}}></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">Próximo nivel: 500 puntos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
