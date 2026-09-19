import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Globe, Clock, Lock, KeyRound } from 'lucide-react';

interface EducationalGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EducationalGuideModal: React.FC<EducationalGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Guide des 5 Signaux Majeurs du Phishing
              </h3>
              <p className="text-xs text-slate-400">
                Comprendre les tactiques d'ingénierie sociale pour déjouer les arnaques
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-300">
          {/* Rule 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>1. L'urgence artificielle (« 24 heures avant blocage »)</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              La création d'un faux sentiment d'urgence ou de panique (amende imminente, compte bloqué sous 24h, colis renvoyé le soir même) est la signature n°1 du phishing. Les attaquants veulent que vous agissiez sous le coup de l'émotion avant que votre esprit critique ne s'enclenche.
            </p>
            <p className="text-emerald-400 font-medium">
              💡 Règle d'or : Plus le message presse d'agir rapidement, plus il y a de chances qu'il s'agisse d'une escroquerie.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <Globe className="w-4 h-4" />
              <span>2. L'anatomie d'un faux nom de domaine</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              Les escrocs insèrent souvent le nom officiel dans un sous-domaine trompeur :
            </p>
            <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] space-y-1">
              <div>❌ <span className="text-rose-400">ameli.fr</span>.connexion-portail-securise.<span className="text-rose-400 font-bold underline">com</span></div>
              <div className="text-slate-400">Le véritable site interrogé est « connexion-portail-securise.com », PAS ameli.fr !</div>
              <div className="pt-1 text-emerald-400">✅ Le vrai domaine officiel se termine strictement par <strong className="text-emerald-300 font-mono">ameli.fr</strong> ou <strong className="text-emerald-300 font-mono">.gouv.fr</strong>.</div>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>3. Le piège du cadenas HTTPS</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              Un cadenas vert / HTTPS signifie uniquement que la connexion entre votre navigateur et le serveur est chiffrée. <strong>Il ne garantit ABSOLUMENT PAS que le site est honnête !</strong> Plus de 80% des sites de phishing modernes disposent aujourd'hui d'un certificat SSL gratuit (Let's Encrypt, Cloudflare).
            </p>
          </div>

          {/* Rule 4 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
              <KeyRound className="w-4 h-4" />
              <span>4. Les données taboues</span>
            </div>
            <p className="leading-relaxed text-slate-300">
              Aucune banque, aucun service des impôts ni aucune administration ne vous demandera par message votre mot de passe, les 16 chiffres de votre carte bancaire avec cryptogramme, ou le code secret reçu par SMS pour une soi-disant "validation de sécurité".
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
          >
            J'ai compris
          </button>
        </div>
      </div>
    </div>
  );
};
