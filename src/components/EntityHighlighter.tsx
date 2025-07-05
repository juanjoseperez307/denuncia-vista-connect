
import React, { useState, useEffect } from 'react';

interface EntityHighlighterProps {
  text: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

const EntityHighlighter: React.FC<EntityHighlighterProps> = ({ text, onChange, placeholder }) => {
  const [entities, setEntities] = useState<any[]>([]);

  // Mock entity detection - in real implementation this would call an API
  useEffect(() => {
    const detectEntities = (inputText: string) => {
      const entityPatterns = [
        { pattern: /Hospital\s+[A-Z][a-z]+/g, type: 'institution', color: 'bg-red-100 text-red-800' },
        { pattern: /Palermo|Recoleta|San Telmo|Belgrano/g, type: 'location', color: 'bg-blue-100 text-blue-800' },
        { pattern: /ANSES|AFIP|Ministerio/g, type: 'government', color: 'bg-green-100 text-green-800' },
        { pattern: /\$\d+(?:,\d{3})*(?:\.\d{2})?/g, type: 'money', color: 'bg-yellow-100 text-yellow-800' }
      ];

      const foundEntities: any[] = [];
      entityPatterns.forEach(({ pattern, type, color }) => {
        const matches = inputText.match(pattern);
        if (matches) {
          matches.forEach(match => {
            foundEntities.push({ text: match, type, color });
          });
        }
      });

      setEntities(foundEntities);
    };

    if (text) {
      detectEntities(text);
    } else {
      setEntities([]);
    }
  }, [text]);

  const highlightText = (inputText: string) => {
    if (!entities.length) return inputText;

    let highlightedText = inputText;
    entities.forEach(entity => {
      const regex = new RegExp(`(${entity.text})`, 'g');
      highlightedText = highlightedText.replace(regex, `<mark class="px-1 py-0.5 rounded ${entity.color}">$1</mark>`);
    });

    return highlightedText;
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
      />
      
      {/* Preview with highlighted entities */}
      {text && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa con entidades detectadas:</h4>
          <div 
            className="text-sm text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightText(text) }}
          />
        </div>
      )}

      {/* Entity Legend */}
      {entities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-600">Entidades detectadas:</span>
          {Array.from(new Set(entities.map(e => e.type))).map(type => (
            <span key={type} className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
              {type === 'institution' && '🏢 Instituciones'}
              {type === 'location' && '📍 Ubicaciones'}
              {type === 'government' && '🏛️ Gobierno'}
              {type === 'money' && '💰 Montos'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntityHighlighter;
