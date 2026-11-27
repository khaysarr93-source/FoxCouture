/**
 * Foxe'Couture — Module Intégration WhatsApp (wa.me)
 * Permet aux artisans tailleurs d'envoyer instantanément des reçus, 
 * rappels de livraisons et avis de prêt aux clientes et clients via WhatsApp.
 */

export interface WhatsAppMessageOptions {
  clientPhone: string;
  clientNom: string;
  atelierNom?: string;
  atelierTel?: string;
}

/**
 * Nettoie et formate un numéro de téléphone pour WhatsApp (ex: Sénégal +221)
 */
export function formatPhoneNumberForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  // Si numéro sénégalais à 9 chiffres commençant par 7, ajouter 221
  if (cleaned.length === 9 && cleaned.startsWith('7')) {
    cleaned = '221' + cleaned;
  }
  return cleaned;
}

/**
 * Crée un lien direct wa.me avec message pré-rempli encodé
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = formatPhoneNumberForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Messages types pré-formatés pour l'artisan
 */
export const WhatsAppTemplates = {
  /**
   * Reçu de commande avec acompte et solde
   */
  recuCommande: (params: {
    clientNom: string;
    reference: string;
    modele: string;
    total: number;
    acompte: number;
    solde: number;
    dateLivraison?: string;
    atelierNom: string;
  }) => {
    const formattedDate = params.dateLivraison 
      ? new Date(params.dateLivraison).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Bientôt communiqué';

    return `*Reçu de Commande — ${params.atelierNom}*\n\n` +
      `Bonjour *${params.clientNom}*,\n` +
      `Nous confirmons l'enregistrement de votre commande *${params.reference}* chez *${params.atelierNom}*.\n\n` +
      `👗 *Modèle :* ${params.modele}\n` +
      `💰 *Montant total :* ${params.total.toLocaleString('fr-FR')} FCFA\n` +
      `💵 *Acompte versé :* ${params.acompte.toLocaleString('fr-FR')} FCFA\n` +
      `⏳ *Solde restant :* ${params.solde.toLocaleString('fr-FR')} FCFA\n` +
      `📅 *Date de livraison prévue :* ${formattedDate}\n\n` +
      `Merci pour votre confiance ! À très bientôt chez ${params.atelierNom}. ✨`;
  },

  /**
   * Notification d'invitation à l'essayage
   */
  invitationEssayage: (params: {
    clientNom: string;
    reference: string;
    modele: string;
    atelierNom: string;
  }) => {
    return `*Invitation Essayage — ${params.atelierNom}*\n\n` +
      `Bonjour *${params.clientNom}*,\n` +
      `Votre tenue (*${params.modele}*, Réf: *${params.reference}*) est prête pour l'essayage dans notre atelier ! ✂️👗\n\n` +
      `Nous vous invitons à passer à votre convenance pour ajuster les derniers détails.\n\n` +
      `À très bientôt,\n*${params.atelierNom}*`;
  },

  /**
   * Notification commande terminée et prête à la livraison
   */
  commandePrete: (params: {
    clientNom: string;
    reference: string;
    modele: string;
    solde: number;
    atelierNom: string;
  }) => {
    let soldeText = params.solde > 0 
      ? `\n💰 *Solde à régler à la livraison :* ${params.solde.toLocaleString('fr-FR')} FCFA\n`
      : `\n✅ *Commande intégralement réglée.*\n`;

    return `*Votre Commande est Prête ! — ${params.atelierNom}*\n\n` +
      `Bonjour *${params.clientNom}*,\n` +
      `Excellente nouvelle ! Votre vêtement (*${params.modele}*, Réf: *${params.reference}*) est parfaitement confectionné, repassé et disponible au retrait dans notre atelier. ✨👗${soldeText}\n` +
      `Merci pour votre fidélité !\n*${params.atelierNom}*`;
  },

  /**
   * Rappel de solde impayé / dette client bienveillant
   */
  rappelSolde: (params: {
    clientNom: string;
    reference: string;
    solde: number;
    atelierNom: string;
    moyensPaiement?: string;
  }) => {
    const moyens = params.moyensPaiement || 'Espèces, Wave ou Orange Money';
    return `*Rappel amical — ${params.atelierNom}*\n\n` +
      `Bonjour cher(e) *${params.clientNom}*,\n` +
      `Sauf erreur de notre part, un solde de *${params.solde.toLocaleString('fr-FR')} FCFA* reste à régler sur votre commande *${params.reference}*.\n\n` +
      `Vous pouvez régler par *${moyens}*.\n` +
      `Restant à votre entière disposition,\n*${params.atelierNom}*`;
  },

  /**
   * Fiche de mesures client
   */
  ficheMesures: (params: {
    clientNom: string;
    typeVetement: string;
    mensurations: Record<string, number>;
    atelierNom: string;
  }) => {
    const liste = Object.entries(params.mensurations)
      .map(([k, v]) => `• ${k.replace(/_/g, ' ')} : *${v} cm*`)
      .join('\n');

    return `*Fiche de Mesures — ${params.atelierNom}*\n\n` +
      `Bonjour *${params.clientNom}*,\n` +
      `Voici votre fiche de mensurations enregistrée pour *${params.typeVetement}* :\n\n` +
      `${liste}\n\n` +
      `Conservée précieusement chez *${params.atelierNom}* pour vos prochaines créations ! ✂️`;
  }
};
