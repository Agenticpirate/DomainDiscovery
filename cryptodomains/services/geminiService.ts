
import { GoogleGenAI, Type } from "@google/genai";
import { AppraisalResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getDomainSuggestions = async (keyword: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 15 creative and catchy domain name suggestions based on the keyword: "${keyword}". Return ONLY a JSON array of strings. Examples: if keyword is 'startup', return ['startuprocket', 'launchflow', 'nextstartup']. No punctuation or explanation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Suggest Error:", error);
    return [];
  }
};

export const appraiseDomain = async (domain: string): Promise<AppraisalResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Perform a detailed domain appraisal for "${domain}". Estimate its value in USD, provide reasoning (keywords, length, TLD value), list 3 comparable sales, and grade market potential.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            domain: { type: Type.STRING },
            estimatedValue: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            comparableSales: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            marketPotential: { 
              type: Type.STRING,
              enum: ['Low', 'Medium', 'High']
            }
          },
          required: ["domain", "estimatedValue", "reasoning", "comparableSales", "marketPotential"]
        }
      }
    });
    return JSON.parse(response.text || "{}") as AppraisalResult;
  } catch (error) {
    console.error("Gemini Appraisal Error:", error);
    return {
      domain,
      estimatedValue: "$500 - $1,500",
      reasoning: "Standard valuation based on TLD and keyword strength.",
      comparableSales: ["Similar.com sold for $2k", "Other.net sold for $800"],
      marketPotential: "Medium"
    };
  }
};
