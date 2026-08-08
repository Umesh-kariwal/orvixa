import React, { useState } from 'react';
import type { RendererComponentProps } from '../core/types';
import { Copy, Check, Info, AlertTriangle, Lightbulb, Star } from 'lucide-react';

const getMermaidUrl = (spec: string): string => {
  try {
    const base64 = btoa(encodeURIComponent(spec).replace(/%([0-9A-F]{2})/g, (_match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    return `https://mermaid.ink/img/${base64}`;
  } catch (e) {
    console.error('Failed to encode mermaid spec:', e);
    return '';
  }
};

export const SafeMarkdownRenderer: React.FC<RendererComponentProps> = ({ payload }) => {
  const content = payload.summary || payload.structured_data?.markdown || '';

  // Safe Stripper: Clears unsafe raw HTML to ensure zero injection risks
  const sanitizeText = (raw: string): string => {
    return raw.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '');
  };

  const safeContent = sanitizeText(content);

  // Helper to parse inline styles safely (bold, code, links, images)
  const parseInline = (text: string): React.ReactNode[] => {
    const tokenRegex = /(\*\*.*?\*\*|`.*?`|!\[.*?\]\(.*?\)|\[.*?\]\(.*?\))/g;
    const parts = text.split(tokenRegex);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--brand-primary)',
              padding: '2px 6px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
              fontSize: '0.82em',
              fontWeight: 600,
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('![') && part.includes('](')) {
        const match = part.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          return (
            <div
              key={i}
              style={{
                margin: '10px 10px 10px 0',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                backgroundColor: 'rgba(15, 15, 25, 0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'inline-flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '340px',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                verticalAlign: 'top',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 25px rgba(99, 102, 241, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.25)';
              }}
            >
              <div style={{
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}>
                <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🖼️ Visual Illustration
                </span>
              </div>
              <div style={{ width: '100%', height: '180px', overflow: 'hidden', backgroundColor: '#000000' }}>
                <img
                  src={match[2]}
                  alt={match[1]}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.5s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  loading="lazy"
                />
              </div>
              {match[1] && (
                <div
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    padding: '8px 12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    lineHeight: '1.35',
                  }}
                >
                  {match[1]}
                </div>
              )}
            </div>
          );
        }
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
                fontWeight: 600,
                transition: 'color var(--motion-fast) ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brand-primary)')}
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
            margin: '0 0 18px 24px',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            lineHeight: '1.65',
            animation: 'fadeIn 0.25s ease-out forwards',
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

        if (codeBlockLang === 'mermaid') {
          const imgUrl = getMermaidUrl(codeText);
          renderedBlocks.push(
            <div
              key={blockId}
              style={{
                margin: '18px 0',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '20px',
                boxShadow: 'var(--shadow-md)',
                animation: 'fadeIn 0.3s ease-out forwards',
              }}
            >
              <img
                src={imgUrl}
                alt="Flowchart Diagram"
                style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                loading="lazy"
              />
              <div style={{ fontSize: '0.7rem', color: 'rgba(0,0,0,0.4)', marginTop: '10px', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                Visual Flowchart Diagram
              </div>
            </div>
          );
        } else {
          renderedBlocks.push(
            <div
              key={blockId}
              style={{
                position: 'relative',
                margin: '14px 0 18px 0',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                backgroundColor: 'rgba(10, 15, 30, 0.95)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                animation: 'fadeIn 0.3s ease-out forwards',
              }}
            >
              {/* Header toolbar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: 'rgba(20, 25, 45, 0.5)',
                }}
              >
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', fontWeight: 700 }}>
                  {codeBlockLang || 'code'}
                </span>
                <button
                  onClick={() => handleCopyCode(codeText, blockId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isCopied ? '#10b981' : 'rgba(255,255,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    transition: 'all var(--motion-fast) ease',
                  }}
                  onMouseEnter={(e) => { if(!isCopied) e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { if(!isCopied) e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                  title="Copy to clipboard"
                >
                  {isCopied ? <Check size={12} /> : <Copy size={12} />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              {/* Code Content */}
              <pre
                style={{
                  margin: 0,
                  padding: '14px',
                  overflowX: 'auto',
                  fontSize: '0.82rem',
                  fontFamily: 'SFMono-Regular, Consolas, Monaco, monospace',
                  color: '#e2e8f0',
                  lineHeight: 1.6,
                }}
              >
                <code>{codeText}</code>
              </pre>
            </div>
          );
        }
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
      let backgroundColor = 'rgba(99, 102, 241, 0.04)';
      let label = 'Note';
      let icon = <Info size={14} style={{ color: 'var(--brand-primary)' }} />;

      if (calloutText.startsWith('[!NOTE]')) {
        calloutText = calloutText.slice(7).trim();
      } else if (calloutText.startsWith('[!WARNING]')) {
        borderLeftColor = 'var(--rose-primary)';
        backgroundColor = 'rgba(239, 68, 68, 0.03)';
        label = 'Warning';
        icon = <AlertTriangle size={14} style={{ color: 'var(--rose-primary)' }} />;
        calloutText = calloutText.slice(10).trim();
      } else if (calloutText.startsWith('[!TIP]')) {
        borderLeftColor = 'var(--emerald-primary)';
        backgroundColor = 'rgba(16, 185, 129, 0.03)';
        label = 'Tip';
        icon = <Lightbulb size={14} style={{ color: 'var(--emerald-primary)' }} />;
        calloutText = calloutText.slice(6).trim();
      } else if (calloutText.startsWith('[!IMPORTANT]')) {
        borderLeftColor = 'var(--amber-primary)';
        backgroundColor = 'rgba(245, 158, 11, 0.03)';
        label = 'Important';
        icon = <Star size={14} style={{ color: 'var(--amber-primary)' }} />;
        calloutText = calloutText.slice(12).trim();
      }

      renderedBlocks.push(
        <div
          key={`callout-${idx}`}
          style={{
            margin: '14px 0 18px 0',
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            borderLeft: `4px solid ${borderLeftColor}`,
            borderTop: '1px solid var(--border-color)',
            borderRight: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: backgroundColor,
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            animation: 'fadeIn 0.25s ease-out forwards',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: borderLeftColor, marginBottom: '6px' }}>
            {icon}
            <span>{label}</span>
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            {parseInline(calloutText)}
          </div>
        </div>
      );
      continue;
    }

    // 3. Headers handler
    const h3Match = line.match(/^###\s*(.*)/);
    if (h3Match) {
      flushList(idx);
      renderedBlocks.push(
        <h4
          key={`h3-${idx}`}
          style={{
            margin: '22px 0 10px 0',
            fontSize: '1.08rem',
            fontWeight: 800,
            color: 'var(--brand-primary)',
            letterSpacing: '-0.01em',
            animation: 'fadeIn 0.25s ease-out forwards',
          }}
        >
          {parseInline(h3Match[1].trim())}
        </h4>
      );
      continue;
    }
    const h2Match = line.match(/^##\s*(.*)/);
    if (h2Match) {
      flushList(idx);
      renderedBlocks.push(
        <h3
          key={`h2-${idx}`}
          style={{
            margin: '28px 0 12px 0',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px',
            animation: 'fadeIn 0.25s ease-out forwards',
          }}
        >
          {parseInline(h2Match[1].trim())}
        </h3>
      );
      continue;
    }
    const h1Match = line.match(/^#\s*(.*)/);
    if (h1Match) {
      flushList(idx);
      renderedBlocks.push(
        <h2
          key={`h1-${idx}`}
          style={{
            margin: '32px 0 16px 0',
            fontSize: '1.45rem',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            borderLeft: '4px solid var(--brand-primary)',
            paddingLeft: '12px',
            animation: 'fadeIn 0.25s ease-out forwards',
          }}
        >
          {parseInline(h1Match[1].trim())}
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
        <li key={`li-${idx}`} style={{ marginBottom: '6px', listStyleType: 'square' }}>
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
        <li key={`li-${idx}`} style={{ marginBottom: '6px' }}>
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
          margin: '0 0 14px 0',
          fontSize: '0.88rem',
          lineHeight: 1.65,
          color: 'var(--text-secondary)',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          animation: 'fadeIn 0.25s ease-out forwards',
        }}
      >
        {parseInline(rawLine)}
      </p>
    );
  }

  // Flush remaining lists at the end
  flushList(lines.length);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {renderedBlocks}
    </div>
  );
};
