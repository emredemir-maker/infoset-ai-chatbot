import { GoogleGenAI, Type } from "@google/genai";
import { Script, AgentLog, TaxonomyCategory, Bot, EscalationRule } from "../types";

// API ANAHTARI
const API_KEY = "AIzaSyAkzNcUVIkdA_X680buDGO1Vuim6DJS7y8";

/**
 * MODELLER: 
 * gemini-3-flash (Varsayılan)
 * gemini-2.5-flash
 */

export const generateBotPrompt = async (botName: string, botRole: string, tone: string, model: string = 'gemini-3-flash', lang: string = 'tr'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Bot Name: ${botName}\nRole: ${botRole}\nTone: ${tone}`,
      config: {
        systemInstruction: `You are an AI Engineer. Write a professional System Prompt for this bot based on provided info. The output must be strictly in ${lang === 'tr' ? 'TURKISH' : 'ENGLISH'}.`,
      }
    });
    return response.text || "You are a helpful assistant.";
  } catch (e) { return "Error occurred."; }
};

export const generateCategoryContext = async (categoryName: string, scripts: Script[], model: string = 'gemini-3-flash', lang: string = 'tr'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const sampleData = scripts.slice(0, 10).map(s => s.content).join('\n---\n');
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `CATEGORY: ${categoryName}\nDATA:\n${sampleData}`,
      config: {
        systemInstruction: `You are an AI Training Expert. Analyze the provided knowledge snippets and produce a professional "Intelligence Definition" in ${lang === 'tr' ? 'TURKISH' : 'ENGLISH'}.`,
      }
    });
    return response.text || "Analysis failed.";
  } catch (e) { return "Error."; }
};

export const generateTestVariations = async (script: Script, level: string = 'Intermediate', model: string = 'gemini-3-flash', lang: string = 'tr'): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate a user question for: ${script.content}`,
      config: { systemInstruction: `Return the question as a single line. Language: ${lang === 'tr' ? 'TURKISH' : 'ENGLISH'}.` }
    });
    return [response.text || "Test question failed."];
  } catch (e) { return ["Error."]; }
};

export const analyzeContentWithUAE = async (content: string, categories: string[], model: string = 'gemini-3-flash', lang: string = 'tr'): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: model,
    contents: `Content: ${content}\nPossible Categories: ${categories.join(', ')}`,
    config: {
      systemInstruction: `Analyze text and return intent/keywords in JSON format.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          intent: { type: Type.STRING },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.NUMBER }
        },
        required: ["intent", "keywords"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const processBatchWithUAE = async (
  rows: { title: string; content: string; providedCategory?: string }[],
  existingTaxonomy: TaxonomyCategory[],
  parentContextHint?: string,
  model: string = 'gemini-3-flash',
  lang: string = 'tr'
): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Analyze these ${rows.length} data blocks.`,
      config: {
        systemInstruction: `Analyze category, intent and keywords for each. Return JSON ARRAY.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              intent: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              confidence: { type: Type.NUMBER }
            },
            required: ["category", "intent", "keywords", "confidence"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) { return []; }
};

export const simulateAgenticFlow = async (userInput: string, scripts: Script[], botConfig?: Bot, model: string = 'gemini-3-flash', lang: string = 'tr'): Promise<AgentLog> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const normalizedInput = userInput.toLowerCase();
  const topMatches = scripts.map(s => ({ script: s, score: s.content.toLowerCase().includes(normalizedInput) ? 50 : 0 }))
    .filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
  const context = topMatches.map(m => m.script.content).join('\n---\n');

  const response = await ai.models.generateContent({
    model: model,
    contents: `Question: ${userInput}\nKnowledge: ${context}`,
    config: {
      systemInstruction: `You are an AI assistant. Reply in ${lang === 'tr' ? 'TURKISH' : 'ENGLISH'}.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          intent: { type: Type.STRING },
          category: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          sentiment: { type: Type.STRING }
        },
        required: ["reply", "intent", "category", "reasoning", "confidence", "sentiment"]
      }
    }
  });

  const data = JSON.parse(response.text || "{}");
  return {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('tr-TR'),
    userInput,
    aiResponse: data.reply || "No reply.",
    intent: data.intent || "General",
    category: data.category || "General",
    confidence: data.confidence || 0.7,
    status: 'VERIFIED',
    reasoning: data.reasoning || "",
    sentiment: data.sentiment,
    sourceScriptId: topMatches[0]?.script.id,
    tokenUsage: { prompt: 0, completion: 0, total: 0 }
  };
};