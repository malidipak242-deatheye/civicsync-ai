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
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('your_') || apiKey === '') {
    console.warn('⚠️  OPENROUTER_API_KEY is not set or invalid. Skipping AI analysis.');
    return null;
  }

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = `You are a civic issue classifier for an Indian municipal corporation. Analyze this image of a reported public infrastructure problem.

Classify it into EXACTLY ONE category:
Garbage, Pothole, Street Light, Water Leakage, Drainage, Road Damage, Tree Fallen, Dead Animal, Stray Animal, Illegal Dumping, Public Toilet, Other.

Assign a priority:
- CRITICAL: Immediate danger (fallen tree blocking road, open manhole, live wires)
- HIGH: Significant disruption (large potholes, flooding, major road damage)
- MEDIUM: Noticeable issue (garbage overflow, broken street light)
- LOW: Minor issue (faded markings, small cracks, minor debris)

Return a short title (under 10 words) and a 1-2 sentence summary in English.
Confidence should be between 0.0 and 1.0. 
IMPORTANT: You must return the output STRICTLY as a valid JSON object with the exact keys: "category", "priority", "confidence", "title", "summary".`;

      const isUrl = imageData.startsWith('http://') || imageData.startsWith('https://');
      
      let imageUrlObj;
      if (isUrl) {
        imageUrlObj = { url: imageData };
      } else {
        const cleanBase64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        imageUrlObj = { url: `data:${mimeType};base64,${cleanBase64}` };
      }

      const payload = {
        // Use a highly capable, fast, and cheap vision model available on OpenRouter
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: imageUrlObj }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      };

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://civicsync-api.vercel.app',
          'X-Title': 'CivicSync AI'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`OpenRouter API responded with status: ${res.status} - ${await res.text()}`);
      }

      const responseData = await res.json();
      const contentText = responseData.choices?.[0]?.message?.content;
      
      if (contentText) {
        const parsed = JSON.parse(contentText) as AIAnalysisResult;

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
