import React from 'react';
import { Globe, AlertTriangle, ShieldCheck, ExternalLink, Lock, Unlock } from 'lucide-react';
import { ExtractedUrl } from '../types';

interface UrlsInspectorProps {
  urls: ExtractedUrl[];
}

export const UrlsInspector: React.FC<UrlsInspectorProps> = ({ urls }) => {
  if (!urls || urls.length === 0) return null;

  return (
    <div id="urls-inspector" className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
      <div className="flex items-center space-x-2">
        <Globe className="w-4 h-4 text-rose-400" />
        <h4 className="text-sm font-bold text-white tracking-tight">
          Inspection forensique des URLs & Domaines ({urls.length})
        </h4>
      </div>

      <div className="space-y-3">
        {urls.map((item, idx) => {
          const isHttps = item.url.startsWith('https://');

          return (
            <div
              key={`url-${idx}`}
              className={`p-3.5 rounded-lg border text-xs space-y-2.5 transition-all ${
                item.isSuspicious
                  ? 'bg-rose-950/20 border-rose-900/60'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2 overflow-hidden">
                  {isHttps ? (
                    <span className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px]" title="Certificat SSL présent (Attention : un certificat SSL ne garantit pas la légitimité d'un site !)">
                      <Lock className="w-3 h-3" />
                      <span>HTTPS</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-amber-400 font-mono text-[11px]" title="Connexion non chiffrée (HTTP)">
                      <Unlock className="w-3 h-3" />
                      <span>HTTP non chiffré</span>
                    </span>
                  )}

                  <span className="text-slate-500 font-mono">|</span>

                  <span className="font-mono text-cyan-300 font-semibold truncate max-w-xs sm:max-w-md">
                    Domaine réel : {item.domain}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    item.isSuspicious
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}
                >
                  {item.isSuspicious ? 'Domaine Frauduleux' : 'Domaine Neutre'}
                </span>
              </div>

              {/* Full URL snippet */}
              <div className="p-2 rounded bg-slate-950/80 font-mono text-slate-300 break-all select-all border border-slate-800/80">
                {item.url}
              </div>

              {/* Anomalies listed */}
              {item.reasons.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
                    Anomalies de sécurité constatées :
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
                    {item.reasons.map((r, rIdx) => (
                      <li key={`reason-${idx}-${rIdx}`} className="text-rose-200">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
