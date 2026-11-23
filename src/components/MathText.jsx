import React from 'react';
import katex from 'katex';

/**
 * MathText Component
 * Renders LaTeX math expressions formatted with KaTeX ($...$ or $$...$$).
 * Falls back safely to plain text if KaTeX encounters an error.
 */
export default function MathText({ text, className = '' }) {
  if (!text || typeof text !== 'string') return null;

  // Check if text has LaTeX delimiters
  if (!text.includes('$')) {
    return <span className={className}>{text}</span>;
  }

  const parts = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    const mathRaw = match[0];
    const isBlock = mathRaw.startsWith('$$');
    const mathContent = isBlock ? mathRaw.slice(2, -2) : mathRaw.slice(1, -1);
    parts.push({ type: 'math', content: mathContent, displayMode: isBlock });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <span key={i}>{part.content}</span>;
        }
        try {
          const html = katex.renderToString(part.content, {
            displayMode: part.displayMode,
            throwOnError: false
          });
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (_) {
          return <span key={i} className="font-mono">{part.content}</span>;
        }
      })}
    </span>
  );
}
