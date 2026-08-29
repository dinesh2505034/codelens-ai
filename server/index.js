import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { generateStepTrace } from './services/universalTraceEngine.js';
import { analyzeCode, detectAndFixErrors } from './services/omniCodeAI.js';
import { extractCodeWithTesseract } from './services/ocrService.js';
import { saveShareSession, getShareSession } from './services/shareStore.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for image upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), engine: 'CodeLens AI Ready' });
});

// 1. Step-by-Step Visual Execution Trace
app.post('/api/trace', (req, res) => {
  try {
    const { code, language, customInputs } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    const trace = generateStepTrace(code, language, customInputs);
    return res.json(trace);
  } catch (err) {
    console.error('Trace error:', err);
    return res.status(500).json({ error: 'Failed to generate trace', details: err.message });
  }
});

// 2. Deep Code Explanation & Complexity (CodeLens Native AI)
app.post('/api/explain', (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = analyzeCode(code, language);
    return res.json(result);
  } catch (err) {
    console.error('Explain error:', err);
    return res.status(500).json({ error: 'Failed to analyze code', details: err.message });
  }
});

// 3. Error Detection & 1-Click Debugger
app.post('/api/debug', (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    const debugResult = detectAndFixErrors(code, language);
    return res.json(debugResult);
  } catch (err) {
    console.error('Debug error:', err);
    return res.status(500).json({ error: 'Failed to debug code', details: err.message });
  }
});

// 4. Image-to-Code Optical Character Recognition
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Built-in Optical Character Recognition & Code Syntax Restorer
    try {
      const ocrResult = await extractCodeWithTesseract(file.buffer);
      return res.json(ocrResult);
    } catch (tessErr) {
      console.error('Tesseract recognition failed:', tessErr);
      return res.status(500).json({ error: 'Failed to recognize code from image', details: tessErr.message });
    }
  } catch (err) {
    console.error('OCR error:', err);
    return res.status(500).json({ error: 'Failed to extract code from image', details: err.message });
  }
});

// 5. Shareable Sessions
app.post('/api/share', (req, res) => {
  try {
    const { code, language, title, trace, explanation } = req.body;
    const result = saveShareSession({ code, language, title, trace, explanation });
    return res.json(result);
  } catch (err) {
    console.error('Share error:', err);
    return res.status(500).json({ error: 'Failed to create share link' });
  }
});

app.get('/api/share/:id', (req, res) => {
  try {
    const session = getShareSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Share session not found or expired' });
    }
    return res.json(session);
  } catch (err) {
    console.error('Get share error:', err);
    return res.status(500).json({ error: 'Failed to retrieve share session' });
  }
});

// 6. Direct Code Execution / Runner
app.post('/api/execute', (req, res) => {
  try {
    const { code, language } = req.body;
    const trace = generateStepTrace(code, language);
    const lastStep = trace.steps && trace.steps.length > 0 ? trace.steps[trace.steps.length - 1] : null;
    const output = lastStep ? lastStep.output : 'Execution completed.';
    return res.json({ output, stepsCount: trace.totalSteps });
  } catch (err) {
    return res.status(500).json({ error: 'Execution error', output: err.message });
  }
});

// Serve frontend build if dist exists
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`⚡ CodeLens AI Server running on http://localhost:${PORT}`);
});
