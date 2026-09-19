import { AnalysisResult, AlertSignal, ExtractedUrl, RiskLevel } from '../types';

// Common suspicious TLDs often abused in fast-flux / spam campaigns
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'click', 'link', 'country',
  'stream', 'download', 'bid', 'review', 'trade', 'party', 'science', 'cricket',
  'accountant', 'faith', 'date', 'wang', 'loan', 'racing', 'win', 'vip', 'buzz',
  'rest', 'fit', 'hair', 'monster', 'beauty', 'quest', 'icu', 'cam'
]);

// Well-known brands frequently targeted by phishing campaigns
const BRAND_PATTERNS = [
  {
    name: 'Assurance Maladie (Ameli)',
    keywords: ['ameli', 'assurance maladie', 'carte vitale', 'remboursement ameli', 'dossier médical'],
    legitDomains: ['ameli.fr', 'assurance-maladie.fr'],
  },
  {
    name: 'Direction Générale des Finances Publiques (Impôts)',
    keywords: ['impots.gouv', 'dgfip', 'remboursement d\'impot', 'administration fiscale', 'avis d\'imposition'],
    legitDomains: ['impots.gouv.fr', 'economie.gouv.fr'],
  },
  {
    name: 'PayPal',
    keywords: ['paypal', 'litige paypal', 'paiement suspendu paypal', 'service paypal'],
    legitDomains: ['paypal.com', 'paypal.fr'],
  },
  {
    name: 'Netflix',
    keywords: ['netflix', 'abonnement netflix', 'paiement refusé netflix', 'compte suspendu netflix'],
    legitDomains: ['netflix.com'],
  },
  {
    name: 'La Poste / Colissimo / Chronopost',
    keywords: ['colissimo', 'chronopost', 'la poste', 'frais de douane', 'colis en attente', 'livraison impossible'],
    legitDomains: ['laposte.fr', 'colissimo.fr', 'chronopost.fr'],
  },
  {
    name: 'Amazon',
    keywords: ['amazon', 'commande amazon', 'prime video', 'amazon pay'],
    legitDomains: ['amazon.fr', 'amazon.com'],
  },
  {
    name: 'Microsoft 365 / Outlook',
    keywords: ['microsoft', 'office 365', 'outlook', 'onedrive', 'mot de passe microsoft'],
    legitDomains: ['microsoft.com', 'office.com', 'live.com'],
  },
  {
    name: 'ANTAI (Amendes & Contraventions)',
    keywords: ['antai', 'amende', 'contravention', 'retard de paiement amende', 'radars'],
    legitDomains: ['antai.gouv.fr'],
  },
  {
    name: 'Banque & Services financiers',
    keywords: ['banque postale', 'crédit agricole', 'bnp paribas', 'société générale', 'boursobank', 'caisse d\'epargne'],
    legitDomains: ['labanquepostale.fr', 'credit-agricole.fr', 'mabanque.bnpparibas', 'societegenerale.fr', 'boursobank.com'],
  },
];

// Typosquatting / spoofing replacements (lookalikes)
const TYPO_PATTERNS = [
  { search: /paypa[l1i]/i, legit: 'paypal.com' },
  { search: /am[a4]z[o0]n/i, legit: 'amazon.com' },
  { search: /netf[l1i]x/i, legit: 'netflix.com' },
  { search: /m[i1]cr[o0]s[o0]ft/i, legit: 'microsoft.com' },
  { search: /am[e3]l[i1]/i, legit: 'ameli.fr' },
  { search: /ch[r0]on[o0]p[o0]st/i, legit: 'chronopost.fr' },
  { search: /c[o0]l[i1]ss[i1]m[o0]/i, legit: 'colissimo.fr' },
];

// URL shorteners frequently used to hide actual landing targets
const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 'is.gd', 'cutt.ly', 't.co', 'ow.ly', 'buff.ly', 'rb.gy', 'goo.gl', 'shorturl.at'
]);

/**
 * Extracts and inspects URLs found inside text or directly entered
 */
export function extractAndAnalyzeUrls(text: string): ExtractedUrl[] {
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+|www\.[^\s<>"'{}|\\^`]+|[a-zA-Z0-9-]+\.(?:com|fr|net|org|xyz|top|tk|info|biz|eu|online|site|shop|tech|app|dev)\b[^\s<>"'{}|\\^`]*)/gi;
  const matches = text.match(urlRegex) || [];
  const uniqueUrls = Array.from(new Set(matches));

  return uniqueUrls.map((rawUrl) => {
    let cleanUrl = rawUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    const reasons: string[] = [];
    let domain = '';

    try {
      const parsed = new URL(cleanUrl);
      domain = parsed.hostname.toLowerCase();

      // Check 1: IP address as host
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
      if (isIp) {
        reasons.push('Utilise une adresse IP brute au lieu d\'un nom de domaine officiel');
      }

      // Check 2: Suspicious TLD
      const parts = domain.split('.');
      const tld = parts[parts.length - 1];
      if (SUSPICIOUS_TLDS.has(tld)) {
        reasons.push(`Extension de domaine à haut risque (.${tld}) souvent employée dans les arnaques`);
      }

      // Check 3: Shortener
      if (URL_SHORTENERS.has(domain)) {
        reasons.push('Raccourcisseur d\'URL utilisé pour dissimuler la destination finale réelle');
      }

      // Check 4: Suspicious subdomains mimicking legit services (e.g., ameli.fr.connexion-espace-client.com)
      if (parts.length > 3) {
        reasons.push('Structure complexe à sous-domaines multiples (technique pour tromper l\'utilisateur)');
      }

      const domainWithoutTld = parts.slice(0, -1).join('.');
      if (
        (domainWithoutTld.includes('gouv') && !domain.endsWith('.gouv.fr')) ||
        (domainWithoutTld.includes('ameli') && !domain.endsWith('ameli.fr')) ||
        (domainWithoutTld.includes('paypal') && !domain.endsWith('paypal.com') && !domain.endsWith('paypal.fr')) ||
        (domainWithoutTld.includes('netflix') && !domain.endsWith('netflix.com')) ||
        (domainWithoutTld.includes('laposte') && !domain.endsWith('laposte.fr'))
      ) {
        reasons.push(`Imitation du nom de marque dans un sous-domaine trompeur (le domaine réel est "${domain}")`);
      }

      // Check 5: Suspicious terms in domain
      const suspiciousDomainWords = ['securite', 'connexion', 'verification', 'update', 'login', 'compte', 'espace-client', 'paiement', 'renouveler', 'authentification'];
      const foundWords = suspiciousDomainWords.filter(w => domain.includes(w));
      if (foundWords.length > 0 && !domain.endsWith('.gouv.fr')) {
        reasons.push(`Mots-clés alarmants dans le domaine : ${foundWords.join(', ')}`);
      }

      // Check 6: Hyphen overload (e.g. secure-login-account-update.com)
      const hyphens = (domain.match(/-/g) || []).length;
      if (hyphens >= 2) {
        reasons.push('Nombreux tirets dans le nom de domaine (technique classique de phishing)');
      }

      // Check 7: Punycode / IDN Homograph
      if (domain.startsWith('xn--')) {
        reasons.push('Domaine en Punycode (possible attaque par homoglyphes / caractères invisibles ou cyrilliques)');
      }

    } catch {
      domain = rawUrl;
      reasons.push('Format d\'URL invalide ou malformé');
    }

    return {
      url: rawUrl,
      domain: domain || rawUrl,
      isSuspicious: reasons.length > 0,
      reasons,
    };
  });
}

/**
 * Deterministic cybersecurity detection engine (fast, robust, runs offline / client / server)
 */
export function analyzePhishingLocally(content: string, inputType: 'email' | 'url' | 'auto' = 'auto'): AnalysisResult {
  const trimmed = content.trim();
  const lower = trimmed.toLowerCase();
  const signals: AlertSignal[] = [];

  let detectedBrand: string | undefined = undefined;

  // 1. URL Analysis
  const extractedUrls = extractAndAnalyzeUrls(trimmed);
  const suspiciousUrls = extractedUrls.filter(u => u.isSuspicious);

  if (suspiciousUrls.length > 0) {
    const mainSuspicious = suspiciousUrls[0];
    signals.push({
      id: 'sig-domain-spoofing',
      category: 'suspicious_domain',
      categoryLabel: 'Domaine imitateur & Liens frauduleux',
      title: 'Domaine suspect ou imitateur détecté',
      severity: mainSuspicious.reasons.some(r => r.includes('Imitation')) ? 'critical' : 'high',
      evidence: mainSuspicious.url,
      explanation: `L'URL pointe vers un domaine non officiel (${mainSuspicious.domain}). Raisons identifiées : ${mainSuspicious.reasons.join(' ; ')}.`,
      recommendation: 'Ne cliquez jamais sur ce lien. Vérifiez toujours le nom de domaine principal (les 2 derniers segments avant le premier "/") et passez par vos favoris habituels.',
    });
  }

  // 2. Artificial Urgency (Urgence artificielle & Menaces)
  const urgencyTriggers = [
    { regex: /(?:dans les|sous|d'ici|dans un délai de)\s*(?:24|48|12|72)\s*(?:h|heures?)/i, match: 'Délai d\'urgence strict (24h/48h)' },
    { regex: /(?:compte|accès|service|dossier)\s*(?:bloqué|suspendu|clôturé|restreint|désactivé|résilié)/i, match: 'Menace de blocage ou suspension de compte' },
    { regex: /(?:action|confirmation|validation)\s*(?:immédiate|urgente|requise immédiatement|sans délai)/i, match: 'Pression à l\'action immédiate' },
    { regex: /(?:pénalité|amende|majoration|huissier|poursuites?|sanction)/i, match: 'Menaces de sanctions financières ou judiciaires' },
    { regex: /(?:dernière chance|dernier avis|ultime rappel|mise en demeure)/i, match: 'Sentiment de panique (dernier avertissement)' },
    { regex: /(?:immédiatement|cliquez vite|sans quoi votre)/i, match: 'Incitation hâtive au clic' },
  ];

  const foundUrgencies = urgencyTriggers.filter(t => t.regex.test(lower));
  if (foundUrgencies.length > 0) {
    const sampleMatch = lower.match(foundUrgencies[0].regex)?.[0] || foundUrgencies[0].match;
    signals.push({
      id: 'sig-urgency',
      category: 'artificial_urgency',
      categoryLabel: 'Urgence artificielle & Menaces temporelles',
      title: 'Création d\'un faux sentiment d\'urgence',
      severity: foundUrgencies.length >= 2 ? 'critical' : 'high',
      evidence: `« ${sampleMatch} »`,
      explanation: 'Les cybercriminels créent délibérément un sentiment de panique et de compte à rebours pour court-circuiter votre esprit critique et vous inciter à cliquer sans réfléchir.',
      recommendation: 'Prenez votre temps. Une véritable institution financière, administrative ou entreprise sérieuse ne bloque jamais un compte sans préavis légal.',
    });
  }

  // 3. Credentials & Sensitive Data Harvesting (Demande d\'identifiants / Données sensibles)
  const credentialTriggers = [
    { regex: /(?:mot de passe|password|code secret|code pin|identifiant)/i, match: 'Demande d\'identifiants ou mot de passe' },
    { regex: /(?:carte bancaire|numéro de carte|cryptogramme|cvv|date d'expiration)/i, match: 'Demande d\'informations bancaires complètes' },
    { regex: /(?:code reçu par sms|code de sécurité|code 2fa|code de vérification)/i, match: 'Tentative d\'interception de code 2FA / validation' },
    { regex: /(?:numéro fiscal|numéro de sécurité sociale|carte vitale|téléverser votre pièce d'identité)/i, match: 'Collecte d\'informations d\'identité sensibles' },
    { regex: /(?:mettre à jour vos coordonnées|confirmer vos informations personnelles|vérifier votre identité)/i, match: 'Formulaire de vérification de coordonnées' },
  ];

  const foundCredentials = credentialTriggers.filter(t => t.regex.test(lower));
  if (foundCredentials.length > 0) {
    const sampleCred = lower.match(foundCredentials[0].regex)?.[0] || foundCredentials[0].match;
    signals.push({
      id: 'sig-credentials',
      category: 'credentials_harvesting',
      categoryLabel: 'Tentative de vol d\'identifiants & Données',
      title: 'Demande suspecte de données confidentielles',
      severity: 'critical',
      evidence: `« ${sampleCred} »`,
      explanation: 'Les organismes légitimes ne vous demanderont JAMAIS par email ou SMS de saisir votre mot de passe, numéro complet de carte bancaire ou code reçu par SMS.',
      recommendation: 'Ne saisissez aucune donnée. Si vous avez déjà renseigné un mot de passe, changez-le immédiatement sur le vrai site officiel et faites opposition à votre carte bancaire.',
    });
  }

  // 4. Impersonation & Sender Spoofing
  for (const brand of BRAND_PATTERNS) {
    const hasBrandKeyword = brand.keywords.some(kw => lower.includes(kw));
    if (hasBrandKeyword) {
      detectedBrand = brand.name;
      // Check if text has links that do NOT point to legit domains
      const hasForeignLinks = extractedUrls.some(u => {
        const d = u.domain.toLowerCase();
        return !brand.legitDomains.some(legit => d === legit || d.endsWith('.' + legit));
      });

      if (hasForeignLinks || extractedUrls.length === 0) {
        signals.push({
          id: `sig-brand-${brand.name.toLowerCase().replace(/\s+/g, '-')}`,
          category: 'sender_spoofing',
          categoryLabel: 'Usurpation d\'identité de marque',
          title: `Imitation de ${brand.name}`,
          severity: 'high',
          evidence: `Mentions relatives à : ${brand.name}`,
          explanation: `Le message utilise l'identité visuelle ou le nom de « ${brand.name} », mais les liens ne redirigent pas vers leurs domaines officiels (${brand.legitDomains.join(', ')}).`,
          recommendation: `Accédez au service directement en tapant manuellement l'adresse officielle de ${brand.name} dans votre navigateur ou via l'application mobile dédiée.`,
        });
      }
      break;
    }
  }

  // 5. Generic / Impersonal Salutation
  const impersonalTriggers = [
    { regex: /cher(?:e)?\s+(?:client|cliente|utilisateur|utilisatrice|membre|abonn[ée])/i, label: 'Salutation générique ("Cher client")' },
    { regex: /bonjour\s*,\s*(?:votre|votre compte)/i, label: 'Salutation impersonnelle' },
    { regex: /destinataire\s*inconnu/i, label: 'Absence de personnalisation nominative' }
  ];
  const foundImpersonal = impersonalTriggers.filter(t => t.regex.test(lower));
  if (foundImpersonal.length > 0 && signals.length > 0) {
    signals.push({
      id: 'sig-impersonal-greeting',
      category: 'sender_spoofing',
      categoryLabel: 'Salutation impersonnelle',
      title: 'Absence d\'identification nominative',
      severity: 'low',
      evidence: lower.match(foundImpersonal[0].regex)?.[0] || 'Cher client',
      explanation: 'Votre banque ou fournisseur dispose de votre prénom et nom. L\'usage de formules vagues comme "Cher client" est caractéristique des envois de masse non ciblés.',
      recommendation: 'Méfiez-vous des messages institutionnels qui ne vous nomment pas personnellement.',
    });
  }

  // 6. Deceptive or Shortened Links
  const shortenerUrls = extractedUrls.filter(u => URL_SHORTENERS.has(u.domain));
  if (shortenerUrls.length > 0) {
    signals.push({
      id: 'sig-shortener',
      category: 'deceptive_links',
      categoryLabel: 'Liens masqués & Redirections opaques',
      title: 'Utilisation de réducteurs d\'URL',
      severity: 'medium',
      evidence: shortenerUrls.map(u => u.url).join(', '),
      explanation: 'Les cybercriminels recourent aux raccourcisseurs d\'URL (bit.ly, tinyurl, etc.) pour cacher la véritable cible malveillante et contourner les filtres antispam.',
      recommendation: 'N\'ouvrez jamais un lien raccourci reçu dans un message inattendu sans le déployer au préalable sur un outil de vérification.',
    });
  }

  // 7. Suspicious attachments or executable lures
  const attachmentKeywords = [
    { regex: /\.(?:exe|scr|vbs|iso|bat|cmd|apk|hta|msi)\b/i, label: 'Fichier exécutable potentiellement malveillant' },
    { regex: /(?:activer les macros|activer le contenu|activez les macros)/i, label: 'Injonction d\'activation des macros Office (VBA / Cheval de Troie)' },
    { regex: /(?:archive protégée|mot de passe de l'archive|mot de passe zip)/i, label: 'Archive ZIP chiffrée pour tromper les antivirus' }
  ];
  const foundAttachments = attachmentKeywords.filter(a => a.regex.test(lower));
  if (foundAttachments.length > 0) {
    signals.push({
      id: 'sig-attachment',
      category: 'suspicious_attachments',
      categoryLabel: 'Pièce jointe / Logiciel suspect',
      title: 'Pièce jointe ou vecteur de téléchargement malveillant',
      severity: 'critical',
      evidence: lower.match(foundAttachments[0].regex)?.[0] || 'Vecteur exécutable',
      explanation: 'Le message pousse à télécharger ou exécuter un fichier dangereux ou à activer des macros qui exécutent du code espion (ransomware / info-stealer).',
      recommendation: 'N\'ouvrez JAMAIS cette pièce jointe. Ne l\'enregistrez pas sur votre ordinateur.',
    });
  }

  // Calculate composite risk score
  let score = 5; // Base minimal score
  if (inputType === 'url' && extractedUrls.length === 0 && (trimmed.startsWith('http') || trimmed.includes('.'))) {
    // If user provided a raw domain or URL that has suspicious patterns
    score += 20;
  }

  signals.forEach(sig => {
    switch (sig.severity) {
      case 'critical':
        score += 35;
        break;
      case 'high':
        score += 25;
        break;
      case 'medium':
        score += 15;
        break;
      case 'low':
        score += 8;
        break;
    }
  });

  // Cap score between 0 and 100
  score = Math.min(Math.max(score, 0), 100);

  // If no signals were found at all and text doesn't contain weird elements
  if (signals.length === 0) {
    if (lower.includes('merci') || lower.includes('cordialement') || lower.includes('réunion') || lower.includes('projet')) {
      score = 8;
    } else {
      score = 15;
    }
  }

  let riskLevel: RiskLevel = 'low';
  let verdict = 'Risque très faible / Message sain';

  if (score >= 80) {
    riskLevel = 'critical';
    verdict = 'Tentative de phishing critique avérée';
  } else if (score >= 55) {
    riskLevel = 'high';
    verdict = 'Risque élevé d\'arnaque ou d\'hameçonnage';
  } else if (score >= 25) {
    riskLevel = 'moderate';
    verdict = 'Risque modéré : Éléments suspects détectés';
  } else {
    riskLevel = 'low';
    verdict = 'Message probablement légitime';
  }

  // Summary generation
  let summary = '';
  if (riskLevel === 'critical' || riskLevel === 'high') {
    summary = `Ce message présente plusieurs marqueurs caractéristiques d'une campagne d'hameçonnage (phishing) ${
      detectedBrand ? `usurpant l'identité de ${detectedBrand}` : ''
    }. Nous avons relevé ${signals.length} signal(s) d'alerte majeur(s), notamment des demandes de données confidentielles, des manipulations temporelles ou des redirections vers des domaines trompeurs.`;
  } else if (riskLevel === 'moderate') {
    summary = `Ce contenu contient quelques signaux inhabituels ou des éléments nécessitant une prudence accrue (${signals.length} signal d'alerte détecté). Aucune preuve absolue de malveillance, mais la vigilance est recommandée avant tout clic.`;
  } else {
    summary = 'Aucun signal d\'alarme significatif (urgence artificielle, vol d\'identifiants, domaine contrefait) n\'a été identifié. Respectez néanmoins toujours les règles élémentaires d\'hygiène informatique.';
  }

  // Action plan
  const actionPlan: string[] = [];
  if (riskLevel === 'critical' || riskLevel === 'high') {
    actionPlan.push('NE CLIQUEZ sur aucun lien et n\'ouvrez aucune pièce jointe présente dans ce message.');
    actionPlan.push('Ne communiquez AUCUNE information personnelle, mot de passe ou coordonnée bancaire.');
    if (detectedBrand) {
      actionPlan.push(`Connectez-vous directement sur le portail officiel de ${detectedBrand} via vos favoris habituels pour vérifier d'éventuelles alertes réelles.`);
    }
    actionPlan.push('Signalez ce message sur la plateforme officielle (Signal-Spam, Phishing Initiative ou Pharos pour la France).');
    actionPlan.push('Supprimez immédiatement l\'email ou le SMS après l\'avoir signalé.');
  } else if (riskLevel === 'moderate') {
    actionPlan.push('Survolez les liens avec votre souris avant de cliquer pour visualiser l\'adresse réelle de destination.');
    actionPlan.push('Contactez directement l\'expéditeur par un canal vérifié et indépendant (téléphone officiel, application dédiée) pour confirmation.');
  } else {
    actionPlan.push('Vous pouvez traiter ce message normalement tout en restant attentif aux liens externes.');
  }

  return {
    score,
    riskLevel,
    verdict,
    summary,
    detectedBrand,
    signals,
    extractedUrls,
    actionPlan,
    analyzedWith: 'heuristic-engine',
    timestamp: new Date().toISOString(),
  };
}
