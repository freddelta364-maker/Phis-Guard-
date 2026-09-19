export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export type AlertCategory =
  | 'artificial_urgency'
  | 'suspicious_domain'
  | 'credentials_harvesting'
  | 'sender_spoofing'
  | 'deceptive_links'
  | 'suspicious_attachments';

export interface AlertSignal {
  id: string;
  category: AlertCategory;
  categoryLabel: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string;
  explanation: string;
  recommendation: string;
}

export interface ExtractedUrl {
  url: string;
  domain: string;
  isSuspicious: boolean;
  reasons: string[];
}

export interface AnalysisResult {
  score: number; // 0 - 100
  riskLevel: RiskLevel;
  verdict: string;
  summary: string;
  detectedBrand?: string;
  signals: AlertSignal[];
  extractedUrls: ExtractedUrl[];
  actionPlan: string[];
  analyzedWith: 'gemini-ai' | 'heuristic-engine';
  timestamp: string;
}

export interface SampleItem {
  id: string;
  label: string;
  category: string;
  type: 'email' | 'url';
  content: string;
  description: string;
  expectedRisk: RiskLevel;
}
