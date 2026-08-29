import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Cloud Gemini AI Service
 * Supports multimodal image-to-code OCR extraction, deep reasoning, and bug fixing.
 */

export async function explainWithGemini(code, language, apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('No Gemini API key provided. Using OmniCode AI Native Engine.');
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a world-class Computer Science educator. Analyze the following ${language} code thoroughly.
Return your response ONLY in valid JSON with this exact structure:
{
  "title": "Clear algorithm title",
  "summary": "2-3 sentences explaining what this code does and why",
  "algorithmType": "Category (e.g. Iterative Math, Two Pointers, Dynamic Programming)",
  "complexity": {
    "time": "O(...)",
    "timeDetail": "Detailed mathematical justification of time complexity",
    "space": "O(...)",
    "spaceDetail": "Detailed justification of memory and stack space"
  },
  "keyStructures": [
    { "name": "var_or_array_name", "initialValue": "value", "type": "type" }
  ],
  "lineByLine": [
    { "line": 1, "code": "code snippet", "role": "e.g. Variable binding", "explanation": "Detailed explanation of this exact line" }
  ],
  "perspectives": {
    "eli5": "Explain like I'm 5 with an everyday real-world analogy",
    "senior": "Senior software engineer analysis of memory layout, branching, and performance"
  },
  "tags": ["Tag1", "Tag2"]
}

Source Code:
\`\`\`${language}
${code}
\`\`\``;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function extractCodeFromImageGemini(imageBuffer, mimeType, apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('No Gemini API key provided for image OCR.');
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType || 'image/png'
    }
  };

  const prompt = `You are an OCR and code extraction specialist. Extract ALL computer programming source code visible in this image verbatim.
Detect the programming language (e.g., Python, C, C++, Java, JavaScript).
Return ONLY valid JSON with this exact structure:
{
  "language": "python | cpp | c | java | javascript",
  "code": "the extracted source code exactly formatted with line breaks and indentation",
  "confidence": 0.98,
  "notes": "any relevant notes about the code extracted"
}`;

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text();
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}
