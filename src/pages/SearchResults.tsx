import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Clock, MapPin } from 'lucide-react';
import { serviceFactory } from '../services/ServiceFactory';
import { useApi } from '../hooks/useApi';
import MainLayout from '../components/MainLayout';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    dateRange: '',
    sortBy: 'relevance'
  });

  const { 
    data: results, 
    loading, 
    error 
  } = useApi<any>(
    async () => {
      if (query.trim()) {
        return await serviceFactory.getComplaintsService().searchComplaints(query, filters);
      } else {
        const complaints = await serviceFactory.getComplaintsService().getComplaints(filters);
        return {
          complaints,
          totalResults: complaints.length,
          suggestions: [],
          filters: { categories: [], locations: [] }
        };
      }
    },
    [query, filters]
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <MainLayout>
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Search className="w-6 h-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-800">
              Resultados para: "{query}"
            </h1>
          </div>
          
          {loading ? (
            <p className="text-gray-600">Buscando...</p>
          ) : (
            <p className="text-gray-600">
              {results?.totalResults || 0} reclamos encontrados
            </p>
          )}

          {/* Search Suggestions */}
          {results?.suggestions && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Búsquedas relacionadas:</p>
              <div className="flex flex-wrap gap-2">
                {results.suggestions.map((suggestion: string, index: number) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                  >
                    {suggestion}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Filtros</h3>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  <option value="">Todas las categorías</option>
                  {results?.filters?.categories?.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  <option value="">Todas las ubicaciones</option>
                  {results?.filters?.locations?.map((loc: string) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  <option value="">Cualquier fecha</option>
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="date">Más recientes</option>
                  <option value="popularity">Más populares</option>
                </select>
              </div>

              <button
                onClick={() => setFilters({ category: '', location: '', dateRange: '', sortBy: 'relevance' })}
                className="w-full px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-red-600">Error al realizar la búsqueda</p>
              </div>
            ) : results?.complaints?.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">No se encontraron reclamos para "{query}"</p>
                <p className="text-sm text-gray-500 mt-2">
                  Intenta con otros términos de búsqueda o ajusta los filtros
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results?.complaints?.map((complaint: any) => (
                  <div key={complaint.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Link
                          to={`/complaint/${complaint.id}`}
                          className="text-lg font-semibold text-gray-800 hover:text-orange-600 transition-colors"
                        >
                          {complaint.content.substring(0, 100)}...
                        </Link>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {complaint.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {complaint.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Por {complaint.author}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{complaint.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{complaint.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span>{complaint.likes} likes</span>
                          <span>{complaint.comments} comentarios</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Load More Button */}
                {results?.complaints?.length && results.complaints.length > 0 && (
                  <div className="text-center py-6">
                    <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      Cargar más resultados
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
    </MainLayout>
  );
};

export default SearchResults;