import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  verdict: string;
  detectedBrand?: string;
  signalsCount: number;
  analyzedWith: 'gemini-ai' | 'heuristic-engine';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  riskLevel,
  verdict,
  detectedBrand,
  signalsCount,
  analyzedWith,
}) => {
  // Color configuration
  const getTheme = () => {
    switch (riskLevel) {
      case 'critical':
        return {
          color: '#f43f5e',
          textClass: 'text-rose-400',
          bgClass: 'bg-rose-950/40 border-rose-800/60 text-rose-300',
          gaugeGradient: ['#f43f5e', '#e11d48'],
          glowClass: 'shadow-rose-500/10',
          levelLabel: 'Critique (Phishing Avéré)',
          icon: AlertOctagon,
        };
      case 'high':
        return {
          color: '#f97316',
          textClass: 'text-orange-400',
          bgClass: 'bg-orange-950/40 border-orange-800/60 text-orange-300',
          gaugeGradient: ['#f97316', '#ea580c'],
          glowClass: 'shadow-orange-500/10',
          levelLabel: 'Risque Élevé (Arnaque)',
          icon: ShieldAlert,
        };
      case 'moderate':
        return {
          color: '#f59e0b',
          textClass: 'text-amber-400',
          bgClass: 'bg-amber-950/40 border-amber-800/60 text-amber-300',
          gaugeGradient: ['#f59e0b', '#d97706'],
          glowClass: 'shadow-amber-500/10',
          levelLabel: 'Risque Modéré (Suspect)',
          icon: AlertTriangle,
        };
      case 'low':
      default:
        return {
          color: '#10b981',
          textClass: 'text-emerald-400',
          bgClass: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300',
          gaugeGradient: ['#10b981', '#059669'],
          glowClass: 'shadow-emerald-500/10',
          levelLabel: 'Risque Faible (Probablement Sain)',
          icon: ShieldCheck,
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  // SVG Gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  // Use a 240-degree arc for speedometer look
  const arcLength = circumference * 0.75;
  const progressOffset = arcLength - (score / 100) * arcLength;

  return (
    <div
      id="risk-gauge-card"
      className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6"
    >
      {/* Gauge Visualization */}
      <div className="relative flex flex-col items-center justify-center shrink-0">
        <svg className="w-48 h-48 -rotate-[135deg]" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
            strokeDasharray={arcLength}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={theme.color}
            strokeWidth="12"
            strokeDasharray={arcLength}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
            {score}
            <span className="text-sm font-normal text-slate-400 font-sans">/100</span>
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 mt-1">
            Indice de Danger
          </span>
        </div>
      </div>

      {/* Details & Verdict */}
      <div className="flex-1 text-center md:text-left space-y-3">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${theme.bgClass}`}>
            <IconComponent className="w-3.5 h-3.5" />
            <span>{theme.levelLabel}</span>
          </span>

          {detectedBrand && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
              Imitation ciblée : <strong className="ml-1 text-cyan-300">{detectedBrand}</strong>
            </span>
          )}

          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
            {analyzedWith === 'gemini-ai' ? '✨ Analyse IA Avancée' : '⚡ Moteur Heuristique Cyber'}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-white tracking-tight">
          {verdict}
        </h3>

        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
          {score >= 60 ? (
            <>
              Ce contenu présente <strong className={theme.textClass}>{signalsCount} signal(aux) d'alarme critique(s)</strong>.
              Il s'agit très probablement d'une manœuvre frauduleuse destinée à vous soutirer des identifiants ou de l'argent.
            </>
          ) : score >= 25 ? (
            <>
              Plusieurs anomalies notables ont été relevées (<strong className={theme.textClass}>{signalsCount} signal(aux)</strong>).
              Ne donnez aucune information sensible sans confirmation préalable par un canal officiel.
            </>
          ) : (
            <>
              Aucun marqueur évident de malveillance détecté. Restez néanmoins toujours précautionneux lors de l'ouverture de liens externes.
            </>
          )}
        </p>

        {/* Threat Level bar */}
        <div className="pt-2">
          <div className="flex justify-between text-[11px] font-medium text-slate-400 mb-1.5">
            <span>0 (Sain)</span>
            <span>25 (Modéré)</span>
            <span>60 (Élevé)</span>
            <span>100 (Critique)</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 w-[25%]" title="Zone Saine (0-25)" />
            <div className="h-full bg-amber-500 w-[35%]" title="Zone Suspecte (25-60)" />
            <div className="h-full bg-orange-500 w-[20%]" title="Zone Risquée (60-80)" />
            <div className="h-full bg-rose-600 w-[20%]" title="Zone Critique (80-100)" />
          </div>
        </div>
      </div>
    </div>
  );
};
