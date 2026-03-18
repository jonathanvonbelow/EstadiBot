import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, AlertCircle, BarChart, Activity, Table as TableIcon, Edit3, Calculator, Trash2, Download, CheckCircle, MessageCircle, Bot, Send, Loader2, RefreshCw } from 'lucide-react';
import { Dataset, DescriptiveStats, Message } from '../types';
import { Button } from './Button';
import { analyzeDataWithGemini } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as XLSX from 'xlsx';
import { 
  BarChart as RechartsBar, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';

type InputMode = 'file' | 'manual';
type AnalysisTab = 'exploration' | 'quality' | 'inference';

// Custom components to style tables like spreadsheets (Grid view)
// Explicit borders on all cells
const markdownComponents = {
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-4 shadow-sm">
      <table className="min-w-full border-collapse border border-slate-400 text-sm bg-white" {...props} />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-slate-100" {...props} />
  ),
  tbody: ({ node, ...props }: any) => (
    <tbody {...props} />
  ),
  tr: ({ node, ...props }: any) => (
    <tr className="hover:bg-slate-50 transition-colors" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th className="border border-slate-400 px-4 py-2 text-left font-bold text-slate-800 bg-slate-100" {...props} />
  ),
  td: ({ node, ...props }: any) => (
    <td className="border border-slate-400 px-4 py-2 text-slate-700 align-top" {...props} />
  ),
};

export const DataAnalysis: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [activeTab, setActiveTab] = useState<AnalysisTab>('exploration');
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [stats, setStats] = useState<DescriptiveStats[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [qualityReport, setQualityReport] = useState<{column: string, issue: string, count: number}[]>([]);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper for advanced stats
  const calculateAdvancedStats = (numericValues: number[]): Partial<DescriptiveStats> => {
      const count = numericValues.length;
      if (count === 0) return {};

      const sum = numericValues.reduce((a, b) => a + b, 0);
      const mean = sum / count;
      const sorted = [...numericValues].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[count - 1];
      const range = max - min;
      
      // Median
      const median = count % 2 === 0 
        ? (sorted[count/2 - 1] + sorted[count/2]) / 2 
        : sorted[Math.floor(count/2)];

      // Variance (Sample) & StdDev
      const squaredDiffs = numericValues.map(v => Math.pow(v - mean, 2));
      const variance = count > 1 ? squaredDiffs.reduce((a, b) => a + b, 0) / (count - 1) : 0;
      const stdDev = Math.sqrt(variance);

      // Mode
      const freq: Record<number, number> = {};
      numericValues.forEach(v => freq[v] = (freq[v] || 0) + 1);
      const maxFreq = Math.max(...Object.values(freq));
      const modes = Object.keys(freq).filter(k => freq[parseFloat(k)] === maxFreq);
      const modeStr = modes.length === count ? "No hay moda" : modes.slice(0, 5).join(", ") + (modes.length > 5 ? "..." : "");

      // Quartiles
      const q1Pos = (count + 1) * 0.25;
      const q3Pos = (count + 1) * 0.75;
      
      const getQuantile = (pos: number) => {
        const base = Math.floor(pos) - 1;
        const rest = pos - Math.floor(pos);
        if (base < 0) return sorted[0];
        if (base >= count - 1) return sorted[count - 1];
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
      };

      const q1 = getQuantile(q1Pos);
      const q3 = getQuantile(q3Pos);
      const iqr = q3 - q1;

      return { mean, median, min, max, stdDev, variance, mode: modeStr, range, q1, q3, iqr };
  };

  const calculateStats = (data: Dataset) => {
    const newStats: DescriptiveStats[] = [];
    const newQualityReport: {column: string, issue: string, count: number}[] = [];
    
    data.columns.forEach(col => {
      const missingCount = col.data.filter(v => v === '' || v === null || v === undefined).length;
      if (missingCount > 0) {
        newQualityReport.push({ column: col.name, issue: 'Valores Faltantes (NaN)', count: missingCount });
      }

      if (col.type === 'number') {
        const numericValues = col.data.filter(v => typeof v === 'number' && !isNaN(v)) as number[];
        const count = numericValues.length;
        const missing = col.data.length - count;

        if (count > 0) {
          const advStats = calculateAdvancedStats(numericValues);
          
          // Outlier Detection (IQR Method)
          if (advStats.q1 !== undefined && advStats.q3 !== undefined && advStats.iqr !== undefined) {
             const lowerBound = advStats.q1 - 1.5 * advStats.iqr;
             const upperBound = advStats.q3 + 1.5 * advStats.iqr;
             const outliers = numericValues.filter(v => v < lowerBound || v > upperBound).length;
             if (outliers > 0) {
                newQualityReport.push({ column: col.name, issue: 'Posibles Outliers (IQR)', count: outliers });
             }
          }

          newStats.push({
            column: col.name,
            count,
            missing,
            mean: advStats.mean,
            median: advStats.median,
            stdDev: advStats.stdDev,
            min: advStats.min,
            max: advStats.max,
            mode: advStats.mode,
            variance: advStats.variance,
            range: advStats.range,
            q1: advStats.q1,
            q3: advStats.q3,
            iqr: advStats.iqr
          });
        }
      }
    });
    setStats(newStats);
    setQualityReport(newQualityReport);
  };

  // Generic function to process 2D array of data (from CSV or Excel)
  const processRawData = (headers: string[], rows: any[][], fileName: string) => {
    try {
        if (rows.length === 0) throw new Error("El archivo no contiene datos.");

        const columns = headers.map((header, index) => {
            const rawData = rows.map(r => r[index]);
            // Attempt to determine if column is numeric
            // Checks if existing values are numbers, allowing for empty/null
            const isNumber = rawData.every(v => 
                v === null || 
                v === undefined || 
                v === '' || 
                typeof v === 'number' || 
                (!isNaN(parseFloat(v)) && isFinite(v))
            );
            
            const parsedData = rawData.map(v => {
                if (v === null || v === undefined || v === '') return '';
                return isNumber ? parseFloat(v) : v;
            });
            
            return {
                name: header,
                type: isNumber ? 'number' : 'string',
                data: parsedData
            };
        });

        const newDataset = {
            name: fileName,
            columns: columns as any,
            rowCount: rows.length
        };

        setDataset(newDataset);
        calculateStats(newDataset);
        setError(null);
        setChatMessages([{
            id: 'init', 
            role: 'model', 
            content: `He analizado tu archivo **${newDataset.name}**. \n\nVeo ${newDataset.rowCount} filas y ${newDataset.columns.length} variables. \n\nCuéntame qué deseas investigar (ej: "¿Hay diferencias significativas entre tratamientos?" o "¿Cómo se relacionan la altura y el diámetro?").`, 
            timestamp: Date.now() 
        }]);
    } catch (err) {
        setError("Error al procesar la estructura de los datos.");
        console.error(err);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isExcel) {
      setError('Por favor sube un archivo válido (.csv, .xlsx, .xls).');
      return;
    }

    const reader = new FileReader();

    if (isCSV) {
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                if (lines.length < 2) throw new Error("El archivo está vacío o no tiene datos.");
                const headers = lines[0].split(',').map(h => h.trim());
                const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim()));
                processRawData(headers, rows, file.name);
            } catch (err) {
                setError("Error al leer el archivo CSV.");
            }
        };
        reader.readAsText(file);
    } else if (isExcel) {
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
                
                if (jsonData.length < 2) throw new Error("El archivo Excel está vacío o no tiene datos suficientes.");
                
                const headers = jsonData[0].map(String);
                const rows = jsonData.slice(1);
                processRawData(headers, rows, file.name);
            } catch (err) {
                console.error(err);
                setError("Error al leer el archivo Excel. Asegúrate de que la primera hoja contenga los datos.");
            }
        };
        reader.readAsArrayBuffer(file);
    }
  };

  const handleManualAnalysis = () => {
      const values = manualInput
        .split(/[\s,;\n\t]+/)
        .map(s => s.trim())
        .filter(s => s !== "")
        .map(Number)
        .filter(n => !isNaN(n));

      if (values.length < 2) {
          setError("Por favor ingresa al menos 2 valores numéricos válidos.");
          return;
      }

      const newDataset: Dataset = {
          name: "Datos Manuales",
          rowCount: values.length,
          columns: [{
              name: "Variable X",
              type: 'number',
              data: values
          }]
      };

      setDataset(newDataset);
      calculateStats(newDataset);
      setError(null);
      setChatMessages([{
          id: 'init-manual',
          role: 'model',
          content: 'He procesado tus datos manuales. ¿Qué análisis te gustaría realizar?',
          timestamp: Date.now()
      }]);
  };

  // --- Data Cleaning Functions ---
  const handleAutoClean = () => {
    if (!dataset) return;

    const cleanedColumns = dataset.columns.map(col => {
        let newData = [...col.data];
        
        // Impute numeric missing values with Median
        if (col.type === 'number') {
            const numericVals = newData.filter(v => typeof v === 'number' && !isNaN(v)) as number[];
            if (numericVals.length > 0) {
                const sorted = [...numericVals].sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];
                newData = newData.map(v => (v === '' || isNaN(v as number)) ? median : v);
            }
        } else {
            // For categorical, fill with "Desconocido"
             newData = newData.map(v => (v === '' || v === undefined) ? 'Desconocido' : v);
        }
        return { ...col, data: newData };
    });

    const cleanedDataset = { ...dataset, columns: cleanedColumns, name: `Cleaned_${dataset.name}` };
    setDataset(cleanedDataset);
    calculateStats(cleanedDataset); // Re-run stats
    alert("Datos limpiados: Se imputaron valores faltantes con la Mediana (numéricos) o 'Desconocido' (texto).");
  };

  const downloadCleanCSV = () => {
    if (!dataset) return;
    
    const headers = dataset.columns.map(c => c.name).join(',');
    const rows = Array.from({ length: dataset.rowCount }, (_, i) => {
        return dataset.columns.map(c => c.data[i]).join(',');
    }).join('\n');
    
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${dataset.name}.csv`); // Always download as CSV for simplicity
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Inference Chat Functions ---
  const handleChatSubmit = async () => {
      if (!chatInput.trim() || isChatLoading || !dataset) return;

      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: Date.now() };
      setChatMessages(prev => [...prev, userMsg]);
      setChatInput('');
      setIsChatLoading(true);

      try {
          // Prepare limited history for context
          const history = chatMessages.slice(-6).map(m => ({role: m.role, content: m.content}));
          const response = await analyzeDataWithGemini(userMsg.content, dataset, stats, history);
          
          setChatMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'model',
              content: response,
              timestamp: Date.now()
          }]);
      } catch (err) {
          console.error(err);
      } finally {
          setIsChatLoading(false);
      }
  };
  
  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);


  const getHistogramData = (colName: string) => {
    if (!dataset) return [];
    const col = dataset.columns.find(c => c.name === colName);
    if (!col || col.type !== 'number') return [];

    const values = col.data.filter(v => typeof v === 'number') as number[];
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const bins = 10;
    const binWidth = (max - min) / bins || 1;
    
    const histogram = Array.from({ length: bins }, (_, i) => {
      const start = min + i * binWidth;
      const end = min + (i + 1) * binWidth;
      const count = values.filter(v => v >= start && (i === bins - 1 ? v <= end : v < end)).length;
      return {
        range: `${start.toFixed(1)} - ${end.toFixed(1)}`,
        count
      };
    });
    return histogram;
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header / Input Section */}
      <div className="bg-white p-6 border-b border-slate-200 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-emerald-600" />
              Estadística Descriptiva
            </h2>
            <p className="text-slate-500 text-sm mt-1">
               {inputMode === 'file' ? 'Sube tu archivo .csv o .xlsx' : 'Pega tus datos numéricos'} para obtener un reporte completo.
            </p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button
               onClick={() => { setInputMode('file'); setDataset(null); setError(null); }}
               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${inputMode === 'file' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <div className="flex items-center gap-2"><Upload size={14} /> Subir Archivo</div>
             </button>
             <button
               onClick={() => { setInputMode('manual'); setDataset(null); setError(null); }}
               className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${inputMode === 'manual' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <div className="flex items-center gap-2"><Edit3 size={14} /> Entrada Manual</div>
             </button>
          </div>
        </div>

        {/* INPUT UI */}
        {!dataset && (
            <>
                {inputMode === 'file' && (
                    <div className="flex gap-2">
                        <input type="file" accept=".csv, .xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        <Button variant="primary" icon={<Upload size={16} />} onClick={() => fileInputRef.current?.click()}>
                        Cargar CSV / Excel
                        </Button>
                    </div>
                )}
                {inputMode === 'manual' && (
                    <div className="w-full">
                        <textarea
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                        rows={3}
                        placeholder="Ej: 12.5, 14.2, 11.8, 15.6, 13.0 (Separados por coma o espacio)"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        />
                        <div className="mt-2">
                        <Button variant="primary" icon={<Calculator size={16} />} onClick={handleManualAnalysis}>Calcular</Button>
                        </div>
                    </div>
                )}
            </>
        )}

        {/* DATASET LOADED HEADER */}
        {dataset && (
            <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700"><FileText size={20} /></div>
                    <div>
                        <p className="font-bold text-emerald-900 text-sm">{dataset.name}</p>
                        <p className="text-xs text-emerald-600">{dataset.rowCount} filas, {dataset.columns.length} columnas</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setDataset(null); setStats([]); setChatMessages([]); }} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 size={16} className="mr-1" /> Cerrar
                </Button>
            </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}
      </div>

      {/* MAIN CONTENT TABS */}
      {dataset && (
        <>
            <div className="px-6 pt-4 bg-white border-b border-slate-200 flex gap-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('exploration')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'exploration' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Exploración Descriptiva
                </button>
                <button 
                    onClick={() => setActiveTab('quality')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'quality' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Calidad & Limpieza
                    {qualityReport.length > 0 && <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full">{qualityReport.length}</span>}
                </button>
                <button 
                    onClick={() => setActiveTab('inference')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'inference' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Asistente de Análisis
                    <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full">AI</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                
                {/* --- TAB 1: EXPLORATION --- */}
                {activeTab === 'exploration' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Summary Table */}
                        <section>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <TableIcon size={18} /> Resumen Estadístico
                            </h3>
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                    <tr>
                                    <th className="px-4 py-3 min-w-[100px]">Variable</th>
                                    <th className="px-4 py-3">N</th>
                                    <th className="px-4 py-3">Media</th>
                                    <th className="px-4 py-3">Mediana</th>
                                    <th className="px-4 py-3">Desv. Est.</th>
                                    <th className="px-4 py-3">Mín</th>
                                    <th className="px-4 py-3">Máx</th>
                                    <th className="px-4 py-3">Q1 / Q3</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stats.map((s) => (
                                    <tr key={s.column} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{s.column}</td>
                                        <td className="px-4 py-3 text-slate-600">{s.count}</td>
                                        <td className="px-4 py-3 font-mono text-emerald-700 font-medium">{s.mean?.toFixed(2)}</td>
                                        <td className="px-4 py-3 font-mono text-slate-600">{s.median?.toFixed(2)}</td>
                                        <td className="px-4 py-3 font-mono text-slate-600">{s.stdDev?.toFixed(2)}</td>
                                        <td className="px-4 py-3 font-mono text-slate-600">{s.min}</td>
                                        <td className="px-4 py-3 font-mono text-slate-600">{s.max}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.q1?.toFixed(1)} / {s.q3?.toFixed(1)}</td>
                                    </tr>
                                    ))}
                                </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Visualizations */}
                        <section>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <BarChart size={18} /> Visualización
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {stats.slice(0, 4).map((s) => (
                                <div key={`chart-${s.column}`} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-80">
                                    <h4 className="text-sm font-medium text-slate-500 mb-4 text-center">Histograma: {s.column}</h4>
                                    <ResponsiveContainer width="100%" height="90%">
                                    <RechartsBar data={getHistogramData(s.column)}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="range" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" height={40} />
                                        <YAxis tick={{fontSize: 10}} />
                                        <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{fill: '#f1f5f9'}}
                                        />
                                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Frecuencia" />
                                    </RechartsBar>
                                    </ResponsiveContainer>
                                </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* --- TAB 2: QUALITY & CLEANING --- */}
                {activeTab === 'quality' && (
                    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <CheckCircle className="text-emerald-600" size={20} />
                                Diagnóstico de Calidad
                            </h3>
                            
                            {qualityReport.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <p className="font-medium text-emerald-800">¡Tus datos parecen limpios!</p>
                                    <p className="text-sm mt-1">No se detectaron valores nulos ni outliers evidentes por rango intercuartílico.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid gap-3">
                                        {qualityReport.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="text-amber-600" size={18} />
                                                    <div>
                                                        <span className="font-semibold text-slate-800">{item.column}</span>
                                                        <span className="text-slate-500 text-sm ml-2">- {item.issue}</span>
                                                    </div>
                                                </div>
                                                <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                                                    {item.count} casos
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <h4 className="font-semibold text-slate-800 mb-2">Herramientas de Corrección</h4>
                                        <p className="text-sm text-slate-500 mb-4">
                                            EstadísticaBot puede intentar corregir estos problemas automáticamente imputando la <strong>mediana</strong> en valores numéricos y marcando como "Desconocido" los textos faltantes.
                                        </p>
                                        <div className="flex gap-4">
                                            <Button variant="primary" icon={<RefreshCw size={16} />} onClick={handleAutoClean}>
                                                Auto-Corregir Datos
                                            </Button>
                                            <Button variant="outline" icon={<Download size={16} />} onClick={downloadCleanCSV}>
                                                Exportar Datos Limpios
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- TAB 3: INFERENTIAL ASSISTANT --- */}
                {activeTab === 'inference' && (
                    <div className="h-[calc(100vh-250px)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                        <div className="p-4 bg-purple-50 border-b border-purple-100">
                            <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                                <Bot size={16} />
                                Asistente de Análisis Estadístico
                            </h3>
                            <p className="text-xs text-purple-700 mt-1">
                                Describe tu objetivo (ej: "Comparar altura entre sitios") y te sugeriré la prueba adecuada.
                            </p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-purple-100 text-purple-700'}`}>
                                        {msg.role === 'user' ? <MessageCircle size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-slate-100 text-slate-800' : 'bg-white border border-slate-200 shadow-sm'}`}>
                                        <ReactMarkdown 
                                          components={markdownComponents} 
                                          remarkPlugins={[remarkGfm]}
                                        >
                                          {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <div className="flex gap-2">
                                <textarea 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleChatSubmit();
                                        }
                                    }}
                                    placeholder="Describe qué quieres analizar de estos datos..."
                                    className="flex-1 resize-none border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                                    rows={1}
                                    style={{minHeight: '44px'}}
                                />
                                <button 
                                    onClick={handleChatSubmit}
                                    disabled={isChatLoading || !chatInput.trim()}
                                    className="bg-purple-600 text-white rounded-lg p-3 hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                >
                                    {isChatLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
      )}
    </div>
  );
};