/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { WeatherFull } from "../types.ts";

const API_KEY = process.env.GEMINI_API_KEY;

export class GeminiService {
  private static ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

  static async getWeatherSummary(weather: WeatherFull): Promise<string> {
    if (!this.ai) return "Resumo de IA indisponível (Chave API ausente).";

    try {
      const prompt = `
        Aja como um meteorologista especialista no Nordeste Brasileiro.
        Analise o clima atual em ${weather.current.city}:
        - Temperatura: ${weather.current.temp}°C
        - Sensação: ${weather.current.feels_like}°C
        - Humidade: ${weather.current.humidity}%
        - Condição: ${weather.current.description}
        - Vento: ${weather.current.wind_speed} m/s
        - Alertas Ativos: ${weather.alerts?.map(a => a.event).join(', ') || 'Nenhum'}

        Forneça um resumo curto (3-4 frases) em português, focando em:
        1. Alertas críticos se houver.
        2. Dicas práticas para o morador local.
        3. Contexto regional se relevante (ex: Vórtice Ciclônico, El Niño, Seca).
        
        Não use markdown, apenas texto puro.
      `;

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text || "Não foi possível gerar um resumo no momento.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Ocorreu um erro ao gerar o resumo inteligente.";
    }
  }
}
