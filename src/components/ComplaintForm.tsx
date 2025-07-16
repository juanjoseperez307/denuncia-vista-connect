
import React, { useState } from 'react';
import { MapPin, Upload, Tag, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EntityHighlighter from './EntityHighlighter';
import { serviceFactory } from '../services/ServiceFactory';
import { ComplaintFormData } from '../services/interfaces/IComplaintsService';

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [complaintText, setComplaintText] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const categories = [
    { id: 'salud', label: 'Salud', icon: '🏥', color: 'bg-red-100 text-red-800' },
    { id: 'transporte', label: 'Transporte', icon: '🚌', color: 'bg-blue-100 text-blue-800' },
    { id: 'seguridad', label: 'Seguridad', icon: '🛡️', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'educacion', label: 'Educación', icon: '🎓', color: 'bg-green-100 text-green-800' },
    { id: 'ambiente', label: 'Ambiente', icon: '🌱', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'corrupcion', label: 'Corrupción', icon: '⚖️', color: 'bg-purple-100 text-purple-800' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!complaintText.trim() || !category || !location.trim()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const selectedCategory = categories.find(cat => cat.id === category);
      const complaintData: ComplaintFormData = {
        content: complaintText,
        category: selectedCategory ? selectedCategory.label : category,
        location,
        isAnonymous,
        files
      };

      const newComplaint = await serviceFactory.getComplaintsService().createComplaint(complaintData);
      
      // Redirigir al detalle del reclamo creado
      navigate(`/complaint/${newComplaint.id}`);
      
      // Limpiar el formulario
      setComplaintText('');
      setCategory('');
      setLocation('');
      setIsAnonymous(false);
      setFiles([]);
      
    } catch (error) {
      console.error('Error al publicar el reclamo:', error);
      alert('Ocurrió un error al publicar el reclamo. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nuevo Reclamo Ciudadano</h2>
        <p className="text-gray-600">
          Describe tu reclamo de forma clara. Nuestro sistema detectará automáticamente entidades relevantes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Complaint Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe tu reclamo
          </label>
          <EntityHighlighter
            text={complaintText}
            onChange={setComplaintText}
            placeholder="Ejemplo: En el Hospital Italiano de Palermo no hay suficientes médicos de guardia los fines de semana..."
          />
          <p className="text-xs text-gray-500 mt-2">
            Las entidades detectadas aparecerán resaltadas automáticamente
          </p>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Categoría (selecciona una o varias)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  category === cat.id 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium text-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Palermo, CABA o dirección específica"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Adjuntar evidencia (opcional)
          </label>
          <label 
            htmlFor="file-upload" 
            className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer"
          >
            <Upload className="mx-auto w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
            <p className="text-xs text-gray-500">PDF, imágenes, videos (máx. 10MB)</p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.mov"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
          </label>
          {files.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Archivos seleccionados:</p>
              <div className="space-y-1">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-800">Configuración de privacidad</p>
                <p className="text-sm text-gray-600">¿Deseas realizar este reclamo de forma anónima?</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting || !complaintText.trim() || !category || !location.trim()}
            className={`flex-1 font-semibold py-3 px-6 rounded-lg transition-all transform shadow-lg ${
              isSubmitting || !complaintText.trim() || !category || !location.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 hover:scale-105'
            } text-white`}
          >
            {isSubmitting ? 'Publicando...' : 'Publicar Reclamo'}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Guardar Borrador
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintForm;
