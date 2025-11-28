import { GoogleGenAI, Type } from "@google/genai";
import { PhotoEntry, User } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AnalysisResult {
  description: string;
  tags: string[];
  vehicleModel?: string;
  licensePlate?: string;
}

export const analyzePhoto = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    // Remove header if present
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: `
              Atue como um perito especialista em vistoria veicular técnica. Analise esta imagem com alta atenção aos detalhes, mesmo se a qualidade da foto for baixa.

              1. **Identificação**: Identifique o Modelo/Marca e a Placa. Se a imagem estiver borrada, pixelada ou escura, faça sua melhor estimativa baseada nos contornos e formatos visíveis. Se for totalmente impossível, retorne "Ilegível" ou "Não visível".
              2. **Estado de Conservação (Crítico)**: Descreva detalhadamente o estado do veículo. Procure por:
                 - Avarias (amassados, arranhões, pintura queimada).
                 - Estado dos pneus e rodas.
                 - Integridade dos vidros e faróis.
                 - Limpeza e condições gerais.
              3. **Baixa Qualidade**: Se a foto tiver problemas de iluminação ou foco, inclua isso na descrição, mas não deixe de analisar o que for visível (ex: "Imagem escura, mas nota-se veículo sedan prata sem avarias aparentes na lateral").

              Retorne apenas JSON.
            `
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vehicleModel: { 
              type: Type.STRING, 
              description: "O modelo e marca do veículo (ex: Toyota Corolla). Se incerto devido à qualidade, inicie com 'Provável: '" 
            },
            licensePlate: { 
              type: Type.STRING, 
              description: "A placa do veículo formatada (ex: ABC-1234). Use 'ILEGÍVEL' se não puder ser lida." 
            },
            description: { 
              type: Type.STRING, 
              description: "Relatório técnico detalhado sobre o estado físico, avarias encontradas e qualidade da imagem." 
            },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Tags relevantes (ex: 'Avaria', 'Pneu Careca', 'Imagem Escura', 'Sedan', 'Vistoria OK')"
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || "{}");

    return {
      description: result.description || "Análise indisponível devido à qualidade da imagem.",
      tags: result.tags || ["Geral"],
      vehicleModel: result.vehicleModel || "Não identificado",
      licensePlate: result.licensePlate || "Não visível"
    };

  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return {
      description: "Não foi possível analisar a imagem automaticamente. Verifique a conexão ou a qualidade do arquivo.",
      tags: ["Erro IA", "Manual"],
      vehicleModel: "Erro",
      licensePlate: "Erro"
    };
  }
};

export const generateReportSummary = async (photos: PhotoEntry[], users: User[]): Promise<string> => {
    if (photos.length === 0) return "Sem dados suficientes para gerar um relatório.";

    const prompt = `
      Atue como um analista de frota/veicular. Gere um resumo executivo para um relatório PDF.
      
      Dados:
      - Total de veículos vistoriados: ${photos.length}
      - Modelos comuns: ${photos.map(p => p.vehicleModel).slice(0, 5).join(', ')}
      - Última coleta: ${new Date(photos[photos.length - 1].timestamp).toLocaleDateString()}
      
      O tom deve ser profissional e focado em auditoria de veículos.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Resumo indisponível.";
    } catch (e) {
        console.error(e);
        return "Erro ao gerar resumo com IA.";
    }
};