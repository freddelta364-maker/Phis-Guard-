import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Send,
  Sparkles,
  RefreshCw,
  Trash2,
  Clipboard,
  Link2,
  Mail,
  AlertCircle,
  FileSearch,
  ExternalLink,
  ChevronRight,
  History,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { RiskGauge } from './components/RiskGauge';
import { AlertSignalCard } from './components/AlertSignalCard';
import { TextInspector } from './components/TextInspector';
import { UrlsInspector } from './components/UrlsInspector';
import { ActionPlan } from './components/ActionPlan';
import { EducationalGuideModal } from './components/EducationalGuideModal';
import { AnalysisResult } from './types';
import { analyzePhishingLocally } from './utils/phishingDetector';
import { SAMPLE_CASES } from './data/sampleCases';

export default function App() {
  const [content, setContent] = useState<string>('');
  const [inputType, setInputType] = useState<'email' | 'url'>('email');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  // Auto-detect URL when user inputs a single URL
  const handleContentChange = (text: string) => {
    setContent(text);
    setError(null);

    const trimmed = text.trim();
    if (
      (trimmed.startsWith('http://') || trimmed.startsWith('https://') || /^[a-zA-Z0-9-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) &&
      !trimmed.includes('\n') &&
      !trimmed.includes(' ')
    ) {
      setInputType('url');
    }
  };

  // Paste from clipboard helper
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleContentChange(text);
      }
    } catch {
      // Fallback
    }
  };

  // Clear input
  const handleClear = () => {
    setContent('');
    setResult(null);
    setError(null);
    setSelectedSampleId(null);
  };

  // Load a curated sample case
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_CASES.find((s) => s.id === sampleId);
    if (sample) {
      setSelectedSampleId(sample.id);
      setInputType(sample.type);
      setContent(sample.content);
      setResult(null);
      setError(null);
    }
  };

  // Main analyze function: queries server Gemini API with instant local heuristics fallback
  const handleAnalyze = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Veuillez coller le texte d'un email, d'un SMS ou une URL suspecte.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Attempt server-side Gemini intelligence first
      const response = await fetch('/api/analyze-phishing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          inputType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.fallbackToLocal) {
          // Server returned fallback (e.g. no Gemini key configured or server fallback)
          const localResult = analyzePhishingLocally(trimmed, inputType);
          setResult(localResult);
        } else if (data.score !== undefined) {
          setResult(data as AnalysisResult);
        } else {
          const localResult = analyzePhishingLocally(trimmed, inputType);
          setResult(localResult);
        }
      } else {
        // Fallback to local heuristic cybersecurity engine
        const localResult = analyzePhishingLocally(trimmed, inputType);
        setResult(localResult);
      }
    } catch {
      // Network failure or offline -> fallback to high-precision local heuristics
      const localResult = analyzePhishingLocally(trimmed, inputType);
      setResult(localResult);
    } finally {
      setIsLoading(false);
      // Smooth scroll down to results
      setTimeout(() => {
        const resultsEl = document.getElementById('analysis-results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        onOpenGuide={() => setShowGuide(true)}
        hasAnalyzed={Boolean(result)}
        score={result?.score}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bouclier Anti-Hameçonnage & Cyber-Vigilance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Analysez un email, un SMS ou une URL suspecte
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Phis Guard détecte automatiquement les signaux d'alerte critiques :
            <span className="text-slate-300 font-medium"> urgence artificielle</span>,
            <span className="text-slate-300 font-medium"> domaines imitateurs</span>,
            <span className="text-slate-300 font-medium"> requêtes d'identifiants</span> et
            <span className="text-slate-300 font-medium"> liens frauduleux</span>.
          </p>
        </section>

        {/* Quick Sample Selector Bar */}
        <section className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tester des cas d'école réels en 1 clic :</span>
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Sélectionnez un exemple pour charger son contenu
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {SAMPLE_CASES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleLoadSample(sample.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-left flex items-center space-x-1.5 ${
                  selectedSampleId === sample.id
                    ? 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300 font-semibold'
                    : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    sample.expectedRisk === 'critical'
                      ? 'bg-rose-500'
                      : sample.expectedRisk === 'high'
                      ? 'bg-orange-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Primary Input Card */}
        <section className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Input Type Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setInputType('email')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  inputType === 'email'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Texte d'email / SMS</span>
              </button>
              <button
                onClick={() => setInputType('url')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  inputType === 'url'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>URL ou Lien suspect</span>
              </button>
            </div>

            {/* Helper Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePaste}
                className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                title="Coller depuis le presse-papiers"
              >
                <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Coller</span>
              </button>
              {content && (
                <button
                  onClick={handleClear}
                  className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors"
                  title="Effacer le champ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Effacer</span>
                </button>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              id="phishing-input-content"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={
                inputType === 'email'
                  ? "Collez ici le texte intégral de l'email ou du message suspect (y compris expéditeur, objet et liens)..."
                  : "Collez ici l'adresse web suspecte (ex: https://paypa1-security-login.com/verification)..."
              }
              rows={inputType === 'email' ? 7 : 3}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 placeholder:text-slate-600 text-xs sm:text-sm font-mono leading-relaxed transition-colors resize-y outline-none"
            />
            <div className="absolute bottom-3 right-3 text-[11px] text-slate-600 font-mono">
              {content.length} caractères
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Analyse confidentielle et locale des données soumises.</span>
            </div>

            <button
              id="btn-analyze-phishing"
              onClick={handleAnalyze}
              disabled={isLoading || !content.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Inspection en cours...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4 text-white" />
                  <span>Lancer l'analyse Phis Guard</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <section id="analysis-results-section" className="space-y-6 pt-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Rapport Médico-Légal de Sécurité
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(result.timestamp).toLocaleTimeString('fr-FR')}
              </span>
            </div>

            {/* Score & Verdict Gauge */}
            <RiskGauge
              score={result.score}
              riskLevel={result.riskLevel}
              verdict={result.verdict}
              detectedBrand={result.detectedBrand}
              signalsCount={result.signals.length}
              analyzedWith={result.analyzedWith}
            />

            {/* Executive Summary */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Synthèse de l'Analyse
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {/* Alert Signals Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                  <span>Signaux d'Alerte Détectés</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                    {result.signals.length}
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  Classés par sévérité de risque
                </span>
              </div>

              {result.signals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.signals.map((signal) => (
                    <AlertSignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-900/40 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-300">
                    Aucun signal d'alarme critique identifié
                  </h4>
                  <p className="text-xs text-slate-400 max-w-lg mx-auto">
                    Le contenu analysé ne comporte ni manœuvres d'urgence artificielle, ni formulaires de collecte d'identifiants, ni domaine notoirement suspect.
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Text Inspector */}
            <TextInspector content={content} signals={result.signals} />

            {/* URLs Inspector if URLs detected */}
            {result.extractedUrls && result.extractedUrls.length > 0 && (
              <UrlsInspector urls={result.extractedUrls} />
            )}

            {/* Immediate Action Plan */}
            <ActionPlan
              actionPlan={result.actionPlan}
              riskLevel={result.riskLevel}
              detectedBrand={result.detectedBrand}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Phis Guard © {new Date().getFullYear()} — Solution de sensibilisation et détection contre l'ingénierie sociale.
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <button
              onClick={() => setShowGuide(true)}
              className="hover:text-slate-200 transition-colors"
            >
              Guide 5 Règles d'Or
            </button>
            <span>•</span>
            <a
              href="https://www.cybermalveillance.gouv.fr"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-200 transition-colors"
            >
              Cybermalveillance.gouv.fr
            </a>
          </div>
        </div>
      </footer>

      {/* Educational Modal */}
      <EducationalGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />
    </div>
  );
}
