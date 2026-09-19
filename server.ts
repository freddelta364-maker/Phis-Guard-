import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
});

// Phishing analysis API endpoint
app.post("/api/analyze-phishing", async (req, res) => {
  try {
    const { content, inputType } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Le contenu à analyser est vide ou invalide." });
    }

    const ai = getGeminiClient();

    // If Gemini is available, perform deep contextual AI threat intelligence
    if (ai) {
      const prompt = `Tu es Phis Guard, un expert en cybersécurité et en analyse médico-légale des attaques par ingénierie sociale (phishing, smishing, spear-phishing, arnaques aux faux ordres de virement, typosquattage).
Analyse rigoureusement le contenu suivant soumis par un utilisateur. Le type d'entrée est "${inputType || "auto"}".

Contenu à analyser:
"""
${content}
"""

Tâche:
1. Détecte minutieusement tous les signaux d'alerte:
   - Urgence artificielle ou menace temporelle ("compte bloqué sous 24h", "action immédiate", panique, pénalité)
   - Domaine imitant une arnaque, typosquatting, sous-domaines trompeurs, TLD suspect, IP directe
   - Demande d'identifiant, mot de passe, carte de crédit, code 2FA/SMS, données fiscales ou personnelles sensibles
   - Usurpation d'identité d'un organisme (banque, impôts, Ameli, Netflix, PayPal, transporteur postal, etc.)
   - Liens masqués, discordance entre ancre et destination, raccourcisseurs d'URL dissimulant la destination
   - Incohérences orthographiques, syntaxe douteuse ou formulations inhabituelles pour une communication officielle
2. Attribue un score de risque global de 0 à 100 (0 = parfaitement sain/légitime, 100 = tentative de phishing critique avérée).
3. Détermine le niveau de risque: "low" (0-25), "moderate" (26-60), "high" (61-85), "critical" (86-100).
4. Fournis une synthèse claire, le nom de la marque imitée si applicable, des signaux d'alerte précis avec les extraits textuels correspondants, et une liste de conseils d'action immédiats pour l'utilisateur en français.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: {
                type: Type.INTEGER,
                description: "Score de risque de 0 (sûr) à 100 (phishing critique)",
              },
              riskLevel: {
                type: Type.STRING,
                description: "Niveau: 'low', 'moderate', 'high', ou 'critical'",
              },
              verdict: {
                type: Type.STRING,
                description: "Verdict court et percutant (ex: 'Tentative de phishing critique détectée')",
              },
              summary: {
                type: Type.STRING,
                description: "Synthèse détaillée des risques et de la menace observée",
              },
              detectedBrand: {
                type: Type.STRING,
                description: "Nom de la marque ou organisme ciblé/usurpé si applicable, sinon chaîne vide",
              },
              signals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      description: "Catégorie: 'artificial_urgency', 'suspicious_domain', 'credentials_harvesting', 'sender_spoofing', 'deceptive_links', ou 'suspicious_attachments'",
                    },
                    categoryLabel: { type: Type.STRING, description: "Nom lisible de la catégorie en français" },
                    title: { type: Type.STRING, description: "Titre du signal d'alerte" },
                    severity: { type: Type.STRING, description: "'low', 'medium', 'high', ou 'critical'" },
                    evidence: { type: Type.STRING, description: "Extrait ou élément précis relevé dans le message ou l'URL" },
                    explanation: { type: Type.STRING, description: "Pourquoi cet élément est suspect et dangereux" },
                    recommendation: { type: Type.STRING, description: "Conseil précis pour ce signal" },
                  },
                  required: ["id", "category", "categoryLabel", "title", "severity", "evidence", "explanation", "recommendation"],
                },
              },
              extractedUrls: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    url: { type: Type.STRING },
                    domain: { type: Type.STRING },
                    isSuspicious: { type: Type.BOOLEAN },
                    reasons: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ["url", "domain", "isSuspicious", "reasons"],
                },
              },
              actionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Recommandations et réflexes de sécurité immédiats",
              },
            },
            required: ["score", "riskLevel", "verdict", "summary", "signals", "actionPlan"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        ...parsed,
        analyzedWith: "gemini-ai",
        timestamp: new Date().toISOString(),
      });
    }

    // If Gemini key is not configured, signal client to use local heuristic engine
    return res.json({
      fallbackToLocal: true,
      reason: "no_api_key",
    });
  } catch (error: any) {
    console.error("Error in /api/analyze-phishing:", error);
    return res.json({
      fallbackToLocal: true,
      reason: error?.message || "server_error",
    });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express 4: wildcard fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Phis Guard server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
