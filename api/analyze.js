import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.groq_free });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    let jsonText = response.choices[0].message.content.trim();
    jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const analysis = JSON.parse(jsonText);
    res.json(analysis);
  } catch (err) {
    console.error('Erreur analyse:', err);
    res.status(500).json({ error: err.message || 'Erreur interne du serveur.' });
  }
}
