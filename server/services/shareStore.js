import { nanoid } from 'nanoid';

// In-memory persistent share store (with automatic capacity management)
const shareSessions = new Map();

export function saveShareSession({ code, language, title, trace, explanation }) {
  const id = nanoid(8);
  const session = {
    id,
    code,
    language: language || 'python',
    title: title || 'Code Explanation Session',
    trace: trace || null,
    explanation: explanation || null,
    createdAt: new Date().toISOString()
  };

  shareSessions.set(id, session);
  return { id, shareUrl: `/share/${id}`, session };
}

export function getShareSession(id) {
  if (!id || !shareSessions.has(id)) {
    return null;
  }
  return shareSessions.get(id);
}
