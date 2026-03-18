import React from 'react';
import { MessageSquare, Code, BookOpen, BarChart2, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface ExampleQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

interface Category {
  title: string;
  icon: React.ReactNode;
  color: string;
  questions: string[];
}

export const ExampleQuestions: React.FC<ExampleQuestionsProps> = ({ onSelectQuestion }) => {
  const categories: Category[] = [
    {
      title: "Conceptos Teóricos y Ecorregionales",
      icon: <BookOpen size={20} />,
      color: "bg-blue-100 text-blue-700",
      questions: [
        "¿Cuál es la diferencia fundamental entre población y muestra en el contexto de un inventario de biodiversidad?",
        "Explícame qué significan los errores Tipo I y Tipo II usando un ejemplo de monitoreo de especies invasoras.",
        "¿Por qué es importante distinguir entre variables discretas y continuas al medir rasgos funcionales de plantas?",
        "¿Qué supuestos debe cumplir mis datos para aplicar un ANOVA de un factor?"
      ]
    },
    {
      title: "Análisis y Resolución de Problemas",
      icon: <BarChart2 size={20} />,
      color: "bg-purple-100 text-purple-700",
      questions: [
        "Tengo datos de DAP (Diámetro a la Altura del Pecho) de 50 árboles. ¿Qué medidas de resumen debo calcular primero?",
        "Calculé un intervalo de confianza del 95% para la riqueza de especies [12, 18]. ¿Cómo interpreto esto para un informe técnico?",
        "El p-valor de mi test de Shapiro-Wilk es 0.03. ¿Qué me dice esto sobre la normalidad de mis datos?",
        "Quiero comparar el crecimiento de plantines en dos tipos de suelo distintos. ¿Qué prueba estadística me recomiendas?"
      ]
    },
    {
      title: "Generación de Código (Python/R)",
      icon: <Code size={20} />,
      color: "bg-emerald-100 text-emerald-700",
      questions: [
        "Genera un script en Python (pandas) para cargar 'datos_campo.csv', filtrar valores nulos y calcular la media por sitio.",
        "Necesito código en R para realizar un Boxplot comparativo de la altura de árboles entre tres sitios de muestreo.",
        "¿Cómo hago un test t-Student en Python usando la librería scipy?",
        "Dame el código para graficar un histograma con curva de densidad usando seaborn en Python."
      ]
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Preguntas de Ejemplo</h2>
          <p className="text-slate-600">
            Explora la potencialidad de EstadísticaBot seleccionando una pregunta para comenzar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cat.color}`}>
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-slate-800">{cat.title}</h3>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {cat.questions.map((q, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => onSelectQuestion(q)}
                    className="group text-left p-4 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all duration-200 flex justify-between items-start gap-4"
                  >
                    <span className="text-sm text-slate-700 group-hover:text-slate-900 leading-relaxed">
                      {q}
                    </span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-xl p-6 text-slate-300 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-white font-semibold mb-1">¿Tienes tus propios datos?</h4>
            <p className="text-sm opacity-80">
              Ve a la sección "Laboratorio de Datos" para cargar archivos CSV y obtener reportes automáticos.
            </p>
          </div>
          <div className="shrink-0">
             <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                <BarChart2 size={20} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};