import { GoogleGenAI, Type } from '@google/genai';

export interface AIAnalysisResult {
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  title: string;
  summary: string;
}

const MAX_RETRIES = 2;

export const analyzeComplaintImage = async (
  imageData: string, // base64 string or URL
  mimeType: string = 'image/jpeg'
): Promise<AIAnalysisResult | null> => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your_') || apiKey === '') {
    console.warn('⚠️  GEMINI_API_KEY is not set or invalid. Skipping AI analysis.');
    return null;
  }

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are a civic issue classifier for an Indian municipal corporation. Analyze this image of a reported public infrastructure problem.

Classify it into EXACTLY ONE category:
Garbage, Pothole, Street Light, Water Leakage, Drainage, Road Damage, Tree Fallen, Dead Animal, Stray Animal, Illegal Dumping, Public Toilet, Other.

Assign a priority:
- CRITICAL: Immediate danger (fallen tree blocking road, open manhole, live wires)
- HIGH: Significant disruption (large potholes, flooding, major road damage)
- MEDIUM: Noticeable issue (garbage overflow, broken street light)
- LOW: Minor issue (faded markings, small cracks, minor debris)

Return a short title (under 10 words) and a 1-2 sentence summary in English.
Confidence should be between 0.0 and 1.0.`;

      const isUrl = imageData.startsWith('http://') || imageData.startsWith('https://');

      let contents: any[];

      if (isUrl) {
        const res = await fetch(imageData);
        if (!res.ok) throw new Error(`Failed to fetch image URL: ${res.status}`);
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        contents = [
          { text: prompt },
          { inlineData: { mimeType, data: base64 } }
        ];
      } else {
        // Strip data URL prefix if present
        const cleanBase64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        contents = [
          { text: prompt },
          { inlineData: { mimeType, data: cleanBase64 } }
        ];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              priority: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              title: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ['category', 'priority', 'confidence', 'title', 'summary']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as AIAnalysisResult;

        // Validate the response
        const validCategories = ['Garbage', 'Pothole', 'Street Light', 'Water Leakage', 'Drainage', 'Road Damage', 'Tree Fallen', 'Dead Animal', 'Stray Animal', 'Illegal Dumping', 'Public Toilet', 'Other'];
        const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

        if (!validCategories.includes(parsed.category)) parsed.category = 'Other';
        if (!validPriorities.includes(parsed.priority)) parsed.priority = 'MEDIUM';
        if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) parsed.confidence = 0.7;

        return parsed;
      }

      return null;
    } catch (error) {
      lastError = error;
      console.error(`AI Analysis attempt ${attempt}/${MAX_RETRIES} failed:`, error instanceof Error ? error.message : error);
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // exponential backoff
      }
    }
  }

  console.error('AI Analysis failed after all retries:', lastError);
  return null;
};
