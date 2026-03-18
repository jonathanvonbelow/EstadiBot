import { GoogleGenAI, ChatSession, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Dataset, DescriptiveStats } from '../types';

let client: GoogleGenAI | null = null;
let chatSession: ChatSession | null = null;

const getClient = (): GoogleGenAI => {
  if (!client) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API Key not found in environment variables");
      throw new Error("API Key is missing. Please select one using the key selector if available.");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
};

export const initChat = async (unitContext: string): Promise<void> => {
  try {
    const ai = getClient();
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\nContexto actual: El estudiante está consultando sobre: ${unitContext}`,
        temperature: 0.7,
      },
    });
  } catch (error) {
    console.error("Error initializing chat:", error);
  }
};

export const sendMessageToGemini = async (message: string, context?: string): Promise<string> => {
  try {
    if (!chatSession) {
      await initChat(context || "General");
    }

    if (!chatSession) {
        throw new Error("Failed to initialize chat session.");
    }
    
    const result: GenerateContentResponse = await chatSession.sendMessage({
      message: message
    });

    return result.text || "Lo siento, no pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Ocurrió un error al comunicarse con el servicio de IA. Por favor verifica tu conexión o intenta más tarde.";
  }
};

export const generateCodeSnippet = async (prompt: string, language: 'python' | 'r'): Promise<string> => {
    const ai = getClient();
    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Genera un snippet de código en ${language} para: ${prompt}. 
        Asegúrate de incluir comentarios explicativos. 
        Usa librerías estándar como pandas/numpy para Python o base/tidyverse para R.
        Solo devuelve el código dentro de bloques markdown.`
    });
    return result.text || "";
}

export const analyzeDataWithGemini = async (
  userQuery: string, 
  dataset: Dataset, 
  stats: DescriptiveStats[],
  history: {role: 'user' | 'model', content: string}[]
): Promise<string> => {
    const ai = getClient();
    
    // Construct a context summary of the dataset
    const dataContext = `
    DATASET INFO:
    Nombre: ${dataset.name}
    Filas: ${dataset.rowCount}
    Columnas: ${dataset.columns.map(c => c.name + " (" + c.type + ")").join(", ")}
    
    RESUMEN ESTADÍSTICO (Primeras 10 variables):
    ${stats.slice(0, 10).map(s => 
      `- ${s.column}: Media=${s.mean?.toFixed(2)}, Mediana=${s.median?.toFixed(2)}, Nulos=${s.missing}`
    ).join("\n")}
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}
        
        ROL ESPECÍFICO: Eres un consultor experto en análisis de datos biológicos y ecorregionales.
        TU TAREA: Ayudar al estudiante a elegir la prueba estadística correcta (Inferencial, Comparativa, Regresión) basada en SUS datos.
        
        Instrucciones:
        1. Analiza la estructura de los datos provistos en el contexto.
        2. Si el usuario pide un análisis, verifica si los datos cumplen los requisitos (ej. tipos de variable).
        3. Propone una metodología paso a paso (ej. "Primero verifica normalidad con Shapiro-Wilk, luego usa T-Student").
        4. Si es pertinente, genera el código en R o Python para ejecutar ese análisis.
        
        ${dataContext}`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage({ message: userQuery });
    return result.text || "No pude generar un análisis.";
};