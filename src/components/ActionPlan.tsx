import React from 'react';
import { ShieldAlert, CheckCircle2, Flag, ExternalLink, LifeBuoy } from 'lucide-react';
import { RiskLevel } from '../types';

interface ActionPlanProps {
  actionPlan: string[];
  riskLevel: RiskLevel;
  detectedBrand?: string;
}

export const ActionPlan: React.FC<ActionPlanProps> = ({
  actionPlan,
  riskLevel,
  detectedBrand,
}) => {
  const isHighRisk = riskLevel === 'critical' || riskLevel === 'high';

  return (
    <div
      id="action-plan-card"
      className={`p-6 rounded-2xl border ${
        isHighRisk
          ? 'bg-rose-950/20 border-rose-900/50'
          : 'bg-slate-900/90 border-slate-800'
      } space-y-4`}
    >
      <div className="flex items-center space-x-2.5">
        <div className={`p-2 rounded-lg ${isHighRisk ? 'bg-rose-900/40 text-rose-400' : 'bg-slate-800 text-emerald-400'}`}>
          {isHighRisk ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
        </div>
        <div>
          <h4 className="text-base font-bold text-white tracking-tight">
            Plan d'action & Réflexes de protection immédiats
          </h4>
          <p className="text-xs text-slate-400">
            {isHighRisk
              ? 'Conduite à tenir face à cette tentative d\'hameçonnage avérée'
              : 'Recommandations pour vérifier la sécurité de vos échanges'}
          </p>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5 pt-1">
        {actionPlan.map((step, idx) => (
          <div key={`step-${idx}`} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
              isHighRisk ? 'bg-rose-900/80 text-rose-200' : 'bg-emerald-900/80 text-emerald-200'
            }`}>
              {idx + 1}
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {step}
            </p>
          </div>
        ))}
      </div>

      {/* Official Reporting Links (France & Europe) */}
      {isHighRisk && (
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Où signaler cette tentative de phishing ?
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a
              href="https://www.signal-spam.fr"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <span>Signal-Spam (Emails)</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
            <a
              href="https://www.internet-signalement.gouv.fr"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <span>PHAROS (Ministère)</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
            <a
              href="https://www.33700.fr"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <span>33700 (SMS frauduleux)</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
