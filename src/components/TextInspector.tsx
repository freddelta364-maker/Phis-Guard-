import React, { useState } from 'react';
import { Eye, Copy, Check, Info } from 'lucide-react';
import { AlertSignal } from '../types';

interface TextInspectorProps {
  content: string;
  signals: AlertSignal[];
}

export const TextInspector: React.FC<TextInspectorProps> = ({ content, signals }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compile unique triggers from evidence to highlight
  const rawTriggers = signals
    .map(s => {
      let ev = s.evidence.replace(/^[«"]|[»"]$/g, '').trim();
      return ev;
    })
    .filter(t => t.length > 2 && !t.startsWith('http') && !t.includes('\n'));

  // Highlight suspicious words in text
  const renderHighlightedContent = () => {
    if (!content) return null;

    // Split text by lines
    const lines = content.split('\n');

    return (
      <div className="font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
        {lines.map((line, idx) => {
          let lineElements: React.ReactNode[] = [line];

          // Check for URL or triggers
          rawTriggers.forEach((trigger) => {
            const newElements: React.ReactNode[] = [];
            lineElements.forEach((el) => {
              if (typeof el === 'string') {
                const parts = el.split(new RegExp(`(${escapeRegex(trigger)})`, 'gi'));
                parts.forEach((part, pIdx) => {
                  if (part.toLowerCase() === trigger.toLowerCase()) {
                    newElements.push(
                      <mark
                        key={`mark-${idx}-${pIdx}`}
                        className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 py-0.5 rounded font-bold"
                        title="Signal de manipulation ou de menace détecté"
                      >
                        {part}
                      </mark>
                    );
                  } else if (part) {
                    newElements.push(part);
                  }
                });
              } else {
                newElements.push(el);
              }
            });
            lineElements = newElements;
          });

          return (
            <div key={`line-${idx}`} className="min-h-[1.25rem]">
              {lineElements}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="text-inspector" className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-white tracking-tight">
            Analyse textuelle & Balises d'ingénierie sociale
          </h4>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800 border border-slate-700 transition-colors"
          title="Copier le texte analysé"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copié' : 'Copier'}</span>
        </button>
      </div>

      <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/80 max-h-72 overflow-y-auto">
        {renderHighlightedContent()}
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>
          Les segments surlignés en <span className="text-rose-400 font-semibold">rose</span> correspondent aux formules de pression psychologique ou requêtes suspectes identifiées.
        </span>
      </div>
    </div>
  );
};

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
