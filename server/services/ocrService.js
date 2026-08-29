import { createWorker } from 'tesseract.js';

let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('eng');
      return worker;
    })();
  }
  return workerPromise;
}

/**
 * Extract code from image buffer using Tesseract OCR + Code Syntax Restorer
 */
export async function extractCodeWithTesseract(imageBuffer) {
  try {
    const worker = await getWorker();
    const result = await worker.recognize(imageBuffer);
    const rawText = result.data.text || '';

    // Post-process extracted text for code formatting
    const cleanedCode = cleanAndExtractCode(rawText);
    const detectedLang = detectLanguage(cleanedCode);

    return {
      code: cleanedCode || rawText.trim(),
      language: detectedLang,
      confidence: result.data.confidence ? result.data.confidence / 100 : 0.85,
      notes: `Extracted using CodeLens Local OCR Engine (Confidence: ${Math.round(result.data.confidence || 85)}%)`
    };
  } catch (err) {
    console.error('Tesseract OCR error:', err);
    throw err;
  }
}

function cleanAndExtractCode(text) {
  if (!text) return '';

  const rawLines = text.split('\n');
  const codeLines = [];

  // Patterns that indicate UI chrome/noise to ignore
  const noisePatterns = [
    /OmniCode/i,
    /localhost/i,
    /http:\/\//i,
    /OUTPUT & VISUALIZER/i,
    /Explanation of this code/i,
    /Main Block/i,
    /Variables/i,
    /All steps executed/i,
    /Step \d+ of \d+/i,
    /Image to Code/i,
    /Deep AI Explain/i,
    /AI Debugger/i,
    /Search \.\.\./i,
    /ENG IN/i,
    /Google Chrome/i,
    /Search/i,
    /Taskbar/i,
    /Battery/i,
    /WiFi/i
  ];

  for (let line of rawLines) {
    let l = line.trim();
    if (!l) continue;

    // Check if line is UI chrome
    const isNoise = noisePatterns.some(p => p.test(l));
    if (isNoise) continue;

    // Remove line number prefixes like "1 ", "2 |", "5 ->"
    l = l.replace(/^\s*\d+[\s:.)|│►◄>]\s*/, '');
    
    // Normalize smart quotes
    l = l.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    
    // Normalize dashes and arrows
    l = l.replace(/[—–]/g, '-');
    l = l.replace(/—>/g, '->');

    // Fix OCR typos
    l = l.replace(/\bdef\s+/g, 'def ');
    l = l.replace(/\bprlnt\b/g, 'print');
    l = l.replace(/\bwhlle\b/g, 'while');
    l = l.replace(/\blf\b/g, 'if');
    l = l.replace(/\bretum\b/g, 'return');
    l = l.replace(/\bincIude\b/g, 'include');

    // Check if line looks like code or variable assignment or comment
    if (isLikelyCodeLine(l)) {
      codeLines.push(l);
    }
  }

  // If filtered result is too sparse, fallback to all non-noise lines
  if (codeLines.length === 0) {
    for (let line of rawLines) {
      let l = line.trim();
      if (!noisePatterns.some(p => p.test(l)) && l.length > 2) {
        codeLines.push(l.replace(/^\s*\d+[\s:.)|│►◄>]\s*/, ''));
      }
    }
  }

  return codeLines.join('\n').trim();
}

function isLikelyCodeLine(line) {
  const l = line.trim();
  if (!l) return false;

  // Python/C/C++/Java statements
  if (/^(import|from|def|class|if|elif|else|while|for|return|public|static|void|int|float|double|char|bool|include|vector|string|std::|cout|cin|printf|scanf|System\.out)\b/.test(l)) {
    return true;
  }
  // Variable assignments: x = 10, num = ...
  if (/^[a-zA-Z_]\w*\s*=\s*.+/.test(l)) {
    return true;
  }
  // Method or function calls: print(...), math.factorial(...)
  if (/^[a-zA-Z_]\w*(\.[a-zA-Z_]\w*)*\s*\(.*\)/.test(l)) {
    return true;
  }
  // Comments or braces
  if (l.startsWith('#') || l.startsWith('//') || l === '{' || l === '}' || l === '};') {
    return true;
  }

  return false;
}

function detectLanguage(code) {
  const norm = code.toLowerCase();

  if (norm.includes('#include') || norm.includes('std::') || norm.includes('cout') || norm.includes('cin')) {
    return 'cpp';
  }
  if (norm.includes('public class') || norm.includes('system.out.print') || norm.includes('public static void main')) {
    return 'java';
  }
  if (norm.includes('printf(') || norm.includes('scanf(') || (norm.includes('int main') && !norm.includes('cout'))) {
    return 'c';
  }
  if (norm.includes('def ') || norm.includes('import ') || norm.includes('print(') || norm.includes('elif ') || norm.includes('in range(')) {
    return 'python';
  }

  return 'python';
}
