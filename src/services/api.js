/**
 * Frontend API Layer
 * Connects to OmniCode AI Backend with offline fallback support
 */

const API_BASE = '/api';

export async function fetchStepTrace(code, language, customInputs = '') {
  try {
    const res = await fetch(`${API_BASE}/trace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, customInputs })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Trace API request failed:', err);
    throw err;
  }
}

export async function fetchDeepExplanation(code, language, options = {}) {
  const { apiKey, useCloud } = options;
  try {
    const res = await fetch(`${API_BASE}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, apiKey, useCloud })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Explain API request failed:', err);
    throw err;
  }
}

export async function fetchDebugAnalysis(code, language) {
  try {
    const res = await fetch(`${API_BASE}/debug`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Debug API request failed:', err);
    throw err;
  }
}

export async function uploadImageForOCR(imageFile, apiKey = '') {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (apiKey) formData.append('apiKey', apiKey);

    const res = await fetch(`${API_BASE}/ocr`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('OCR API request failed:', err);
    throw err;
  }
}

export async function createShareLink(payload) {
  try {
    const res = await fetch(`${API_BASE}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Share API request failed:', err);
    throw err;
  }
}

export async function getSharedSession(id) {
  try {
    const res = await fetch(`${API_BASE}/share/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Get share request failed:', err);
    throw err;
  }
}
