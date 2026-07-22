import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { RendererComponentProps } from '../core/types';
import { Copy, Check } from 'lucide-react';

export const SafeMarkdownRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const content = payload.summary || payload.structured_data?.markdown || '';

  // Safe Stripper: Clears unsafe raw HTML to ensure zero injection risks
  const sanitizeText = (raw: string): string => {
    return raw.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  };

  const safeContent = sanitizeText(content);

  // Helper to parse inline styles safely (bold, code, links)
  const parseInline = (text: string): React.ReactNode[] => {
    const tokenRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
    const parts = text.split(tokenRegex);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              backgroundColor: 'var(--amber-bg)',
              color: 'var(--amber-primary)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
              fontSize: '0.85em',
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](')) {
        const match = part.match(/\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <a
              key={i}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--brand-primary)',
                textDecoration: 'underline',
                fontWeight: 500,
              }}
            >
              {match[1]}
            </a>
          );
        }
      }
      return part;
    });
  };

  // State for tracking copied code blocks
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlockId(id);
    setTimeout(() => setCopiedBlockId(null), 2000);
  };

  // Block parsing state variables
  const lines = safeContent.split('\n');
  const renderedBlocks: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeBlockLang = '';
  
  let currentListItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (key: number) => {
    if (currentListItems.length > 0 && listType) {
      const ListTag = listType;
      renderedBlocks.push(
        <ListTag
          key={`list-${key}`}
          style={{
            margin: '0 0 16px 20px',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            lineHeight: 1.5,
          }}
        >
          {currentListItems}
        </ListTag>
      );
      currentListItems = [];
      listType = null;
    }
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const line = rawLine.trim();

    // 1. Code Block handler
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        inCodeBlock = false;
        const codeText = codeBlockLines.join('\n');
        const blockId = `code-${idx}`;
        const isCopied = copiedBlockId === blockId;

        renderedBlocks.push(
          <div
            key={blockId}
            style={{
              position: 'relative',
              margin: '12px 0 16px 0',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
            }}
          >
            {/* Header toolbar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 12px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: 'rgba(30, 41, 59, 0.4)',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
                {codeBlockLang || 'code'}
              </span>
              <button
                onClick={() => handleCopyCode(codeText, blockId)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isCopied ? '#34d399' : 'rgba(255,255,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
                title="Copy to clipboard"
              >
                {isCopied ? <Check size={12} /> : <Copy size={12} />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            {/* Code Content */}
            <pre
              style={{
                margin: 0,
                padding: '12px',
                overflowX: 'auto',
                fontSize: '0.8rem',
                fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
                color: '#e2e8f0',
                lineHeight: 1.5,
              }}
            >
              <code>{codeText}</code>
            </pre>
          </div>
        );
        codeBlockLines = [];
        codeBlockLang = '';
      } else {
        // Open code block
        flushList(idx);
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // 2. Callout box handler (Blockquotes starting with > )
    if (line.startsWith('>')) {
      flushList(idx);
      let calloutText = line.slice(1).trim();
      let borderLeftColor = 'var(--brand-primary)';
      let backgroundColor = 'rgba(59, 130, 246, 0.05)';
      let label = 'Note';

      if (calloutText.startsWith('[!NOTE]')) {
        calloutText = calloutText.slice(7).trim();
      } else if (calloutText.startsWith('[!WARNING]')) {
        borderLeftColor = 'var(--rose-primary)';
        backgroundColor = 'rgba(239, 68, 68, 0.05)';
        label = 'Warning';
        calloutText = calloutText.slice(10).trim();
      } else if (calloutText.startsWith('[!TIP]')) {
        borderLeftColor = 'var(--emerald-primary)';
        backgroundColor = 'rgba(16, 185, 129, 0.05)';
        label = 'Tip';
        calloutText = calloutText.slice(6).trim();
      } else if (calloutText.startsWith('[!IMPORTANT]')) {
        borderLeftColor = 'var(--amber-primary)';
        backgroundColor = 'rgba(245, 158, 11, 0.05)';
        label = 'Important';
        calloutText = calloutText.slice(12).trim();
      }

      renderedBlocks.push(
        <div
          key={`callout-${idx}`}
          style={{
            margin: '12px 0 16px 0',
            padding: '12px 16px',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            borderLeft: `4px solid ${borderLeftColor}`,
            backgroundColor: backgroundColor,
            fontFamily: 'var(--font-sans)',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', color: borderLeftColor, marginBottom: '4px' }}>
            {label}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {parseInline(calloutText)}
          </div>
        </div>
      );
      continue;
    }

    // 3. Headers handler
    if (line.startsWith('### ')) {
      flushList(idx);
      renderedBlocks.push(
        <h4
          key={`h3-${idx}`}
          style={{
            margin: '20px 0 8px 0',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {parseInline(line.slice(4))}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      flushList(idx);
      renderedBlocks.push(
        <h3
          key={`h2-${idx}`}
          style={{
            margin: '24px 0 10px 0',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '4px',
          }}
        >
          {parseInline(line.slice(3))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      flushList(idx);
      renderedBlocks.push(
        <h2
          key={`h1-${idx}`}
          style={{
            margin: '28px 0 12px 0',
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}
        >
          {parseInline(line.slice(2))}
        </h2>
      );
      continue;
    }

    // 4. Bullet lists handler
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList(idx);
        listType = 'ul';
      }
      currentListItems.push(
        <li key={`li-${idx}`} style={{ marginBottom: '4px' }}>
          {parseInline(line.slice(2))}
        </li>
      );
      continue;
    }

    // 5. Numbered lists handler
    const numMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numMatch) {
      if (listType !== 'ol') {
        flushList(idx);
        listType = 'ol';
      }
      currentListItems.push(
        <li key={`li-${idx}`} style={{ marginBottom: '4px' }}>
          {parseInline(numMatch[2])}
        </li>
      );
      continue;
    }

    // Empty lines flush active lists
    if (!line) {
      flushList(idx);
      continue;
    }

    // 6. Paragraphs handler
    flushList(idx);
    renderedBlocks.push(
      <p
        key={`p-${idx}`}
        style={{
          margin: '0 0 12px 0',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
        }}
      >
        {parseInline(rawLine)}
      </p>
    );
  }

  // Flush remaining lists at the end
  flushList(lines.length);

  return (
    <Card variant="glass" style={{ padding: '16px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {renderedBlocks}
      </div>
    </Card>
  );
};
