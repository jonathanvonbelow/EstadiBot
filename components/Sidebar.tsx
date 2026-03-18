import React from 'react';
import { UNITS } from '../constants';
import { UnitId, ViewMode } from '../types';
import { BookOpen, BarChart2, MessageSquare, X, GraduationCap, Leaf, Lightbulb, Link as LinkIcon } from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  currentUnit: UnitId;
  onViewChange: (view: ViewMode) => void;
  onUnitChange: (unit: UnitId) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentUnit,
  onViewChange,
  onUnitChange,
  isOpen,
  toggleSidebar
}) => {
  return (
    <div className="flex flex-col h-full bg-emerald-900 text-emerald-50 shadow-xl">
      <div className="p-6 border-b border-emerald-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-2 rounded-lg text-white">
            <Leaf size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">EstadísticaBot</span>
        </div>
        <button onClick={toggleSidebar} className="md:hidden text-emerald-300 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        
        {/* Main Modes */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            Modos de Trabajo
          </p>
          <button
            onClick={() => {
              onViewChange('chat');
              if (window.innerWidth < 768) toggleSidebar();
            }}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${
              currentView === 'chat' 
                ? 'bg-emerald-800 text-white shadow-sm' 
                : 'text-emerald-100 hover:bg-emerald-800/50'
            }`}
          >
            <MessageSquare size={18} className="mr-3" />
            <span className="font-medium">Asistente Virtual</span>
          </button>
          <button
            onClick={() => {
              onViewChange('analysis');
              if (window.innerWidth < 768) toggleSidebar();
            }}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${
              currentView === 'analysis' 
                ? 'bg-emerald-800 text-white shadow-sm' 
                : 'text-emerald-100 hover:bg-emerald-800/50'
            }`}
          >
            <BarChart2 size={18} className="mr-3" />
            <span className="font-medium">Análisis de Datos</span>
          </button>
          <button
            onClick={() => {
              onViewChange('examples');
              if (window.innerWidth < 768) toggleSidebar();
            }}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${
              currentView === 'examples' 
                ? 'bg-emerald-800 text-white shadow-sm' 
                : 'text-emerald-100 hover:bg-emerald-800/50'
            }`}
          >
            <Lightbulb size={18} className="mr-3" />
            <span className="font-medium">Preguntas de Ejemplo</span>
          </button>
          <button
            onClick={() => {
              onViewChange('resources');
              if (window.innerWidth < 768) toggleSidebar();
            }}
            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${
              currentView === 'resources' 
                ? 'bg-emerald-800 text-white shadow-sm' 
                : 'text-emerald-100 hover:bg-emerald-800/50'
            }`}
          >
            <LinkIcon size={18} className="mr-3" />
            <span className="font-medium">Recursos Externos</span>
          </button>
        </div>

        {/* Units - Only visible if in Chat mode */}
        {currentView === 'chat' && (
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
              Unidades Temáticas
            </p>
            {UNITS.map((unit) => (
              <button
                key={unit.id}
                onClick={() => {
                  onUnitChange(unit.id);
                  if (window.innerWidth < 768) toggleSidebar();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  currentUnit === unit.id
                    ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-700'
                    : 'text-emerald-100 hover:bg-emerald-800/50'
                }`}
              >
                <div className="flex items-center">
                  <BookOpen size={16} className={`mr-3 shrink-0 ${currentUnit === unit.id ? 'text-emerald-300' : 'text-emerald-500'}`} />
                  <span className="truncate">{unit.title}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="px-3 pt-4">
          <div className="bg-emerald-950/50 rounded-xl p-4 border border-emerald-800/50">
            <div className="flex items-center gap-2 mb-2 text-emerald-300">
               <GraduationCap size={16} />
               <span className="text-xs font-semibold uppercase">Recursos</span>
            </div>
            <p className="text-xs text-emerald-400/80 leading-relaxed">
              Basado en Mendenhall, Di Rienzo y Zúñiga.
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-emerald-800 bg-emerald-950/30">
        <p className="text-xs text-center text-emerald-400 font-medium mb-1">
          Cátedra de Estadística
        </p>
        <p className="text-[10px] text-center text-emerald-500/80 leading-tight">
          Lic. en Conservación y Desarrollo Ecorregional
        </p>
        <p className="text-[10px] text-center text-emerald-400 mt-2 font-medium">
          Resp: Ing. Jonathan von Below (PhD)
        </p>
        <p className="text-[10px] text-center text-emerald-600 mt-1">
          © 2026
        </p>
      </div>
    </div>
  );
};