import React from 'react';
import {
  Clock,
  Globe,
  KeyRound,
  UserX,
  Link2,
  FileWarning,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { AlertSignal, AlertCategory } from '../types';

interface AlertSignalCardProps {
  signal: AlertSignal;
}

export const AlertSignalCard: React.FC<AlertSignalCardProps> = ({ signal }) => {
  // Map category to icon
  const getCategoryIcon = (category: AlertCategory) => {
    switch (category) {
      case 'artificial_urgency':
        return <Clock className="w-5 h-5 text-amber-400" />;
      case 'suspicious_domain':
        return <Globe className="w-5 h-5 text-rose-400" />;
      case 'credentials_harvesting':
        return <KeyRound className="w-5 h-5 text-rose-400" />;
      case 'sender_spoofing':
        return <UserX className="w-5 h-5 text-purple-400" />;
      case 'deceptive_links':
        return <Link2 className="w-5 h-5 text-orange-400" />;
      case 'suspicious_attachments':
        return <FileWarning className="w-5 h-5 text-rose-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          label: 'Danger Critique',
          className: 'bg-rose-950/80 text-rose-300 border-rose-800/70',
        };
      case 'high':
        return {
          label: 'Menace Élevée',
          className: 'bg-orange-950/80 text-orange-300 border-orange-800/70',
        };
      case 'medium':
        return {
          label: 'Signal Suspect',
          className: 'bg-amber-950/80 text-amber-300 border-amber-800/70',
        };
      case 'low':
      default:
        return {
          label: 'Signal Faible',
          className: 'bg-slate-800 text-slate-300 border-slate-700',
        };
    }
  };

  const badge = getSeverityBadge(signal.severity);

  return (
    <div
      id={`signal-card-${signal.id}`}
      className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
    >
      <div>
        {/* Header with Category & Severity */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
              {getCategoryIcon(signal.category)}
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {signal.categoryLabel}
              </span>
              <h4 className="text-base font-bold text-white tracking-tight">
                {signal.title}
              </h4>
            </div>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${badge.className}`}>
            {badge.label}
          </span>
        </div>

        {/* Evidence Quote / Extracted element */}
        {signal.evidence && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/90">
            <span className="text-[11px] font-mono uppercase text-slate-500 block mb-0.5">
              Élément relevé dans votre message :
            </span>
            <p className="text-xs font-mono text-rose-300 break-all line-clamp-2">
              {signal.evidence}
            </p>
          </div>
        )}

        {/* Explanation */}
        <div className="mt-3 space-y-1">
          <span className="text-xs font-semibold text-slate-300">
            Pourquoi c'est suspect ?
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">
            {signal.explanation}
          </p>
        </div>
      </div>

      {/* Safety Advice */}
      <div className="pt-3 border-t border-slate-800/80 flex items-start space-x-2 text-xs text-emerald-400">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
        <p className="text-slate-300">
          <strong className="text-emerald-400">Réflexe sécurité :</strong> {signal.recommendation}
        </p>
      </div>
    </div>
  );
};
