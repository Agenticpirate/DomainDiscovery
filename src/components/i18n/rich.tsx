import React from 'react';

/** Fill `{name}` placeholders in an already-translated string with React nodes (keeps per-value styling). */
export function rich(text: string, nodes: Record<string, React.ReactNode>): React.ReactNode[] {
  return text.split(/(\{[A-Za-z]+\})/).map((part, i) => {
    const m = part.match(/^\{([A-Za-z]+)\}$/);
    return m && m[1] in nodes ? <React.Fragment key={i}>{nodes[m[1]]}</React.Fragment> : part;
  });
}
