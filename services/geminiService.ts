import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string, companyType: string): Promise<string> => {
  try {
    const prompt = `
      Vepro si një ekspert kulinarez dhe marketing. 
      Shkruaj një përshkrim të shkurtër (maksimumi 2 fjali), tërheqës dhe oreks-ndjellës në gjuhën Shqipe për produktin: "${productName}".
      Ky produkt shërbehet në një biznes të tipit: "${companyType || 'Restorant'}".
      Përshkrimi duhet të jetë shitës.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error generating description:", error);
    return "Nuk u arrit të gjenerohej përshkrimi. Ju lutem provoni përsëri.";
  }
};