import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Shared Gemini client utility on the server with User-Agent set to 'aistudio-build'
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5173;

  // Body parsing middleware
  app.use(express.json());

  // API Route for Tailor and Sizing AI Advice
  app.post('/api/conseil-tailleur', async (req, res) => {
    try {
      const { clientName, clientPreferences, typeVetement, mensurations, notes } = req.body;

      if (!typeVetement || !mensurations) {
        return res.status(400).json({ error: 'Données manquantes (typeVetement et mensurations requis)' });
      }

      // Format mensurations nicely for the AI prompt
      const formattedMensurations = Object.entries(mensurations)
        .map(([key, val]) => {
          // Format key name from camelCase to human readable French
          const keyLabel = key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
          return `- ${keyLabel} : ${val} cm`;
        })
        .join('\n');

      const systemInstruction = `Tu es le Maître Tailleur et Styliste d'élite de la prestigieuse Maison "FOX COUTURE".
Ton rôle est de fournir une analyse morphologique, des conseils de coupe sur-mesure, des suggestions stylistiques techniques de haute couture et des recommandations de matières/tissus.
Sois extrêmement professionnel, chaleureux, élégant et précis dans tes explications en français. Utilise le vocabulaire de la haute couture.`;

      const prompt = `Voici les détails d'un client pour lequel nous préparons une confection sur-mesure.

DÉTAILS CLIENT :
- Nom : ${clientName || 'Client anonyme'}
- Type de vêtement souhaité : ${typeVetement.replace('_', ' ')}
- Préférences de tissu/style connues : ${clientPreferences?.tissusPreferes?.join(', ') || 'Aucune'}, ${clientPreferences?.stylesFavoris?.join(', ') || 'Aucun'}
- Remarques particulières client : "${clientPreferences?.remarquesParticulieres || 'Aucune'}"

MENSURATIONS DU CLIENT :
${formattedMensurations}

NOTES DE COUPE COMPLÉMENTAIRES :
"${notes || 'Aucune note'}"

Donne-nous une fiche de conseils structurée comprenant :
1. **Analyse de la Silhouette / Morphologie** : Déduis-en une analyse flatteuse.
2. **Recommandations de Coupe & Ajustements techniques** : (ex: aisance au niveau des emmanchures, longueur de veste idéale, ajustement de l'entrejambe, pince à prévoir, etc.)
3. **Suggestions de Tissu & Matières** : Propose des matières idéales pour ce modèle parmi le catalogue (Bazin, Coton, Lin, Laine Froide, Soie, Brocart, Super 120s/150s, Wax, etc.) et le métrage approximatif à prévoir.
4. **Conseils de Style de la Maison** : Recommandations stylistiques élégantes exclusives à FOX COUTURE.`;

      // Call the recommended model: 'gemini-3.5-flash'
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const adviceText = response.text || "Impossible de générer des conseils d'atelier pour le moment.";

      return res.json({ advice: adviceText });
    } catch (error: any) {
      console.error("Erreur Gemini API:", error);
      return res.status(500).json({ error: "Erreur lors de la génération des conseils IA : " + error.message });
    }
  });

  // API Route for Order Assembly and Styling Guide
  app.post('/api/conseil-confection', async (req, res) => {
    try {
      const { reference, modeleNom, modeleCategorie, tissuNom, remarquesProduction, clientName, clientPreferences } = req.body;

      if (!modeleNom) {
        return res.status(400).json({ error: "Données manquantes (modeleNom requis)" });
      }

      const systemInstruction = `Tu es le Directeur Artistique et Maître d'Atelier principal de la prestigieuse Maison "FOX COUTURE".
Ton but est de guider tes tailleurs et couturiers sur la direction artistique d'un vêtement particulier commandé par un client, en donnant des suggestions de boutons, doublures, types de broderie/surpiqûres, ainsi que les difficultés techniques liées à la matière utilisée.
Sois extrêmement professionnel, enthousiaste, créatif et utilise le vocabulaire noble de la haute couture en français.`;

      const prompt = `Génère une notice de direction artistique et technique pour la commande suivante :

COMMANDE :
- Référence de commande : ${reference || 'Nouvelle Commande'}
- Modèle : ${modeleNom}
- Catégorie : ${modeleCategorie || 'Non spécifié'}
- Tissu choisi : ${tissuNom || 'Tissu non spécifié ou fourni par le client'}
- Remarques & consignes initiales : "${remarquesProduction || 'Aucune consigne spécifiée'}"
- Client : ${clientName || 'Client d\'élite'}
- Goûts du client : ${clientPreferences?.stylesFavoris?.join(', ') || 'Classique'}, préfère les matières comme ${clientPreferences?.tissusPreferes?.join(', ') || 'Bazin, Lin, Super 120s'}

Fournis-nous un guide d'atelier complet structuré comme suit :
1. **Vision Esthétique & Harmonie** : Détaille les choix esthétiques conseillés pour sublimer le modèle (ex: boutons en nacre ou en corne, ton de doublure en soie assortie, type de col, poches, longueur, style général moderne ou traditionnel).
2. **Spécificités Techniques du Tissu** : Précise les défis et consignes d'atelier pour le tissu choisi (${tissuNom}) (ex: fil à utiliser, tension de machine, précautions au repassage, sens de coupe, aiguille microtex ou standard, etc.).
3. **Plan de Montage Conseillé** : Un enchaînement logique suggéré en 4 ou 5 phases clés pour un résultat digne de la haute couture.
4. **Conseil Signature "Maison FOX"** : L'astuce exclusive du Maître d'Atelier pour ajouter ce "petit plus" raffiné et mémorable à la création.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.75,
        },
      });

      const adviceText = response.text || "Impossible de générer la direction de confection pour le moment.";

      return res.json({ advice: adviceText });
    } catch (error: any) {
      console.error("Erreur Gemini API Confection:", error);
      return res.status(500).json({ error: "Erreur lors de la génération de la direction de confection : " + error.message });
    }
  });

  // Vite middleware for development or Static server for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      const altPort = PORT + 1;
      console.log(`Port ${PORT} déjà utilisé, bascule sur http://localhost:${altPort}`);
      app.listen(altPort, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${altPort}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
