import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { DataAnalysis } from './components/DataAnalysis';
import { ExampleQuestions } from './components/ExampleQuestions';
import { ExternalResources } from './components/ExternalResources';
import { UnitId, ViewMode } from './types';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('chat');
  const [currentUnit, setCurrentUnit] = useState<UnitId>('unit1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pendingQuestion, setPendingQuestion] = useState<string>('');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleSelectQuestion = (question: string) => {
    setPendingQuestion(question);
    setCurrentView('chat');
  };

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'chat': return 'Asistente Virtual';
      case 'analysis': return 'Laboratorio de Datos';
      case 'examples': return 'Preguntas de Ejemplo';
      case 'resources': return 'Recursos Externos';
      default: return 'EstadísticaBot';
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        return <ChatInterface 
          currentUnit={currentUnit} 
          initialMessage={pendingQuestion}
          onMessageSent={() => setPendingQuestion('')}
        />;
      case 'analysis':
        return <DataAnalysis />;
      case 'examples':
        return <ExampleQuestions onSelectQuestion={handleSelectQuestion} />;
      case 'resources':
        return <ExternalResources />;
      default:
        return <ChatInterface currentUnit={currentUnit} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Mobile backdrop overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile open button (only shown when sidebar is closed) */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md md:hidden hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={22} className="text-emerald-700" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative z-40 h-full transition-all duration-300 ease-in-out shrink-0
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0'}
        `}
      >
        <Sidebar
          currentView={currentView}
          currentUnit={currentUnit}
          onViewChange={setCurrentView}
          onUnitChange={setCurrentUnit}
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile spacer / desktop toggle */}
            <div className="w-8 md:hidden" />
            <button
              onClick={toggleSidebar}
              className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <h1 className="text-base font-semibold text-emerald-900">
              {getHeaderTitle()}
            </h1>
          </div>
          <div className="text-xs text-slate-400 hidden sm:block font-medium tracking-wide">
            Lic. en Conservación y Desarrollo Ecorregional
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-0 md:p-5 bg-slate-100">
          <div className="h-full bg-white rounded-none md:rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;