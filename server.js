import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/analyze', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Aucune requête fournie.' });
  }

  const prompt = `Tu es un expert en analyse d'opinions publiques, d'avis consommateurs et de tendances marché.

L'utilisateur veut analyser : "${query.trim()}"

Basé sur tes connaissances générales des opinions publiques, avis utilisateurs, forums, réseaux sociaux et tendances du marché, fournis une analyse de sentiment complète et structurée.

Si la requête mentionne plusieurs produits, services ou sujets, analyse chacun séparément et permets la comparaison.

Retourne UNIQUEMENT un objet JSON valide (sans markdown, sans backticks, sans texte avant ou après) avec cette structure exacte :

{
  "title": "<titre descriptif de l'analyse>",
  "subjects": [
    {
      "name": "<nom exact du sujet analysé>",
      "overall_sentiment": "positif" ou "négatif" ou "neutre" ou "mitigé",
      "overall_score": <entier de 0 à 100 représentant la satisfaction/opinion globale>,
      "summary": "<résumé de 2-3 phrases sur l'opinion générale du public>",
      "strengths": ["<point fort 1>", "<point fort 2>", "<point fort 3>"],
      "weaknesses": ["<point faible 1>", "<point faible 2>"],
      "key_aspects": [
        {
          "aspect": "<nom de l'aspect ex: Performance, Prix, Design, Service client>",
          "sentiment": "positif" ou "négatif" ou "neutre",
          "score": <entier de 0 à 100>,
          "description": "<une phrase expliquant l'opinion sur cet aspect>"
        }
      ]
    }
  ],
  "conclusion": "<conclusion globale de l'analyse en 1-2 phrases>"
}

Inclus entre 4 et 6 key_aspects pertinents par sujet. Sois précis, objectif et basé sur les opinions réelles connues du public.`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Aucun texte dans la réponse Claude.');
    }

    let jsonText = textBlock.text.trim();
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const analysis = JSON.parse(jsonText);
    res.json(analysis);
  } catch (err) {
    console.error('Erreur analyse:', err);
    res.status(500).json({ error: err.message || 'Erreur interne du serveur.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', apiKey: !!process.env.ANTHROPIC_API_KEY });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY non définie dans .env');
  }
});
