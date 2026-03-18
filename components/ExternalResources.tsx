import React from 'react';
import { EXTERNAL_RESOURCES } from '../constants';
import { ExternalLink } from 'lucide-react';

export const ExternalResources: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Recursos Externos y Bibliografía</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Accede a los textos fundamentales de la cátedra, bases de datos reales para tus prácticas y herramientas digitales recomendadas para el análisis estadístico en conservación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EXTERNAL_RESOURCES.map((category, idx) => {
            const Icon = category.icon;
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-slate-800">{category.title}</h3>
                </div>
                <div className="p-4 flex-1">
                  <ul className="space-y-4">
                    {category.links.map((link, lIdx) => (
                      <li key={lIdx} className="group">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-emerald-700 group-hover:underline decoration-emerald-300 underline-offset-2">
                              {link.title}
                            </span>
                            <ExternalLink size={14} className="text-slate-400 group-hover:text-emerald-500 shrink-0 mt-1" />
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {link.description}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-100 rounded-xl p-6 text-center text-slate-500 text-sm">
          <p>
            Estos recursos han sido seleccionados según el documento "Análisis Estadístico Aplicado a la Conservación y el Desarrollo Ecorregional".
            <br />
            Verifica siempre la disponibilidad de los enlaces externos.
          </p>
        </div>
      </div>
    </div>
  );
};