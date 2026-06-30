import React from 'react';

export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by double newlines to handle paragraphs/blocks
  const paragraphs = text.split('\n\n');

  return paragraphs.map((para, pIdx) => {
    const trimmedPara = para.trim();

    // Check if it's a code block
    if (trimmedPara.startsWith('```')) {
      const lines = trimmedPara.split('\n');
      const language = lines[0].replace('```', '').trim();
      const code = lines.slice(1, lines.length - (lines[lines.length - 1].trim() === '```' ? 1 : 0)).join('\n');
      return (
        <pre key={pIdx} className="my-3 overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-sm text-zinc-100 border border-zinc-800/80">
          {language && <div className="mb-2 text-xs uppercase tracking-wider text-zinc-500 font-bold">{language}</div>}
          <code>{code}</code>
        </pre>
      );
    }

    // Check if it's a heading
    if (trimmedPara.startsWith('### ')) {
      return (
        <h4 key={pIdx} className="mb-2 mt-4 font-sans text-base font-bold text-foreground">
          {trimmedPara.replace('### ', '')}
        </h4>
      );
    }
    if (trimmedPara.startsWith('## ')) {
      return (
        <h3 key={pIdx} className="mb-3 mt-5 font-sans text-lg font-bold text-foreground">
          {trimmedPara.replace('## ', '')}
        </h3>
      );
    }
    if (trimmedPara.startsWith('# ')) {
      return (
        <h2 key={pIdx} className="mb-4 mt-6 font-sans text-xl font-bold text-foreground">
          {trimmedPara.replace('# ', '')}
        </h2>
      );
    }

    // Check if it's a bullet list
    const lines = trimmedPara.split('\n');
    if (lines.length > 0 && lines.every(line => {
      const tl = line.trim();
      return tl.startsWith('- ') || tl.startsWith('* ') || tl === '';
    })) {
      return (
        <ul key={pIdx} className="mb-4 list-disc pl-5 space-y-1">
          {lines.map((line, lIdx) => {
            if (line.trim() === '') return null;
            const cleanLine = line.trim().replace(/^[\s-*-]+/, '');
            return (
              <li key={lIdx} className="text-sm text-muted-foreground">
                {renderInlineMarkdown(cleanLine)}
              </li>
            );
          })}
        </ul>
      );
    }

    // Handle normal paragraphs with inline styling
    return (
      <p key={pIdx} className="mb-3 leading-relaxed text-sm text-muted-foreground whitespace-pre-wrap">
        {renderInlineMarkdown(trimmedPara)}
      </p>
    );
  });
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
  const tokens = text.split(regex);

  return tokens.map((token, tIdx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={tIdx} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={tIdx} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground border border-border">{token.slice(1, -1)}</code>;
    }
    if (token.startsWith('[') && token.includes('](')) {
      const match = token.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a key={tIdx} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-ring hover:underline font-medium">
            {match[1]}
          </a>
        );
      }
    }
    return token;
  });
}
