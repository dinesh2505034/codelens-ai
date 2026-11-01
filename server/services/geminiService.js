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
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  parsed.engine = 'Google Gemini 1.5 Flash';
  return parsed;
}

export async function debugWithGemini(code, language, compilerOutput, apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('No Gemini API key provided.');
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert compiler and software debugger. Analyze the following ${language} source code and any compiler/runtime errors provided below.
Find all syntax errors, type errors, semantic bugs, or infinite loop hazards.
Provide clear diagnostic explanations and the complete corrected/repaired source code.

Source Code:
\`\`\`${language}
${code}
\`\`\`

Compiler / Linter Diagnostic:
${compilerOutput || 'None provided'}

Return your response ONLY in valid JSON matching this schema:
{
  "hasErrors": boolean,
  "issues": [
    {
      "line": 1,
      "severity": "Critical Error" | "Warning" | "Logic Bug",
      "type": "Error type name (e.g. SyntaxError, Type Mismatch)",
      "message": "Clear explanation of what is wrong",
      "suggestion": "Specific suggestion on how to fix"
    }
  ],
  "fixedCode": "the complete source code with all bugs fixed so it compiles and runs correctly"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  parsed.engine = 'Google Gemini AI Debugger';
  parsed.issueCount = parsed.issues ? parsed.issues.length : 0;
  return parsed;
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
