import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

interface NavbarProps {
  onOpenGuide: () => void;
  hasAnalyzed: boolean;
  score?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGuide, hasAnalyzed, score }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Phis <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Guard</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                v2.4 Cyber-Shield
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Détecteur intelligent de tentatives de phishing & d'ingénierie sociale
            </p>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {hasAnalyzed && score !== undefined && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Dernier scan :</span>
              <span
                className={`font-bold font-mono ${
                  score >= 80
                    ? 'text-rose-400'
                    : score >= 55
                    ? 'text-orange-400'
                    : score >= 25
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                Score {score}/100
              </span>
            </div>
          )}

          <button
            id="btn-open-guide"
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Guide anti-hameçonnage</span>
          </button>
        </div>
      </div>
    </header>
  );
};
