'use client';

import { useEffect } from 'react';

interface ScriptInjectorProps {
  html?: string;
  target?: 'head' | 'body';
}

// Injects admin-authored custom HTML/script snippets (e.g. tracking pixels, JSON-LD)
// into the live document. Browsers do not execute <script> tags inserted via
// innerHTML/dangerouslySetInnerHTML, so each node is re-created via
// document.createElement to make embedded scripts actually run.
export default function ScriptInjector({ html, target = 'body' }: ScriptInjectorProps) {
  useEffect(() => {
    if (!html || !html.trim()) return;

    const container = document.createElement('div');
    container.innerHTML = html;
    const parent = target === 'head' ? document.head : document.body;
    const injectedNodes: Node[] = [];

    Array.from(container.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const oldScript = node as HTMLScriptElement;
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.text = oldScript.text;
        parent.appendChild(newScript);
        injectedNodes.push(newScript);
      } else {
        const cloned = node.cloneNode(true);
        parent.appendChild(cloned);
        injectedNodes.push(cloned);
      }
    });

    return () => {
      injectedNodes.forEach((node) => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });
    };
  }, [html, target]);

  return null;
}
