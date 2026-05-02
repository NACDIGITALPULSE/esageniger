export type FaqItem = {
  id: string;
  category: "admissions" | "frais" | "pieces" | "delais" | "general";
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  // Admissions
  { id: "a1", category: "admissions", question: "Comment puis-je m'inscrire à ESAGE ?", answer: "Vous pouvez vous inscrire en ligne via la page Admissions. Remplissez le formulaire, téléchargez votre reçu PDF, puis confirmez votre dossier en passant à l'école avec les pièces requises." },
  { id: "a2", category: "admissions", question: "Quelles sont les conditions d'admission en BTS ?", answer: "Pour intégrer un BTS, il faut être titulaire du Baccalauréat (ou équivalent reconnu) et déposer un dossier complet à l'école." },
  { id: "a3", category: "admissions", question: "Y a-t-il un concours d'entrée ?", answer: "Non, l'admission se fait sur étude de dossier. La direction étudie chaque candidature et confirme l'inscription après réception des pièces." },
  { id: "a4", category: "admissions", question: "Puis-je m'inscrire en cours d'année ?", answer: "Les inscriptions sont possibles jusqu'à 3 semaines après la rentrée officielle, sous réserve de places disponibles dans la filière choisie." },

  // Frais
  { id: "f1", category: "frais", question: "Quels sont les frais de scolarité ?", answer: "BTS : 350 000 FCFA / an. Licence : 450 000 FCFA / an. Master : 700 000 FCFA / an. Frais d'inscription unique : 10 000 FCFA." },
  { id: "f2", category: "frais", question: "Puis-je payer en plusieurs fois ?", answer: "Oui, le paiement de la scolarité peut s'effectuer en 3 tranches sans surcoût, échelonnées sur l'année académique." },
  { id: "f3", category: "frais", question: "Quels modes de paiement acceptez-vous ?", answer: "Espèces, virement bancaire et mobile money. Un reçu officiel est délivré pour chaque versement." },

  // Pièces
  { id: "p1", category: "pieces", question: "Quelles pièces fournir pour un BTS ?", answer: "Acte de naissance légalisé, copie légalisée du diplôme (BAC ou équivalent), 4 photos d'identité récentes, et 4 enveloppes timbrées." },
  { id: "p2", category: "pieces", question: "Quelles pièces pour Licence ou Master ?", answer: "Copie légalisée du BTS / Licence / Master selon le niveau visé, acte de naissance légalisé, 4 photos d'identité, et 4 enveloppes timbrées." },
  { id: "p3", category: "pieces", question: "Mes diplômes étrangers sont-ils acceptés ?", answer: "Oui, les diplômes étrangers sont acceptés s'ils sont reconnus par les autorités nigériennes ou accompagnés d'une attestation d'équivalence." },

  // Délais
  { id: "d1", category: "delais", question: "Combien de temps prend le traitement de ma candidature ?", answer: "Notre équipe traite chaque dossier sous 48 à 72 heures ouvrables après réception complète des pièces." },
  { id: "d2", category: "delais", question: "Quand commencent les cours ?", answer: "La rentrée académique a lieu chaque année en octobre. Une session de formation continue est également proposée en janvier." },
  { id: "d3", category: "delais", question: "Combien de temps dure une formation ?", answer: "BTS : 2 ans après le BAC. Licence : 3 ans (ou 1 an après BTS). Master : 2 ans après la Licence." },

  // Général
  { id: "g1", category: "general", question: "ESAGE est-elle reconnue par l'État ?", answer: "Oui, ESAGE délivre des diplômes d'État (BTS) et des diplômes reconnus par les autorités académiques nigériennes." },
  { id: "g2", category: "general", question: "Proposez-vous des cours du soir ?", answer: "Oui, nous proposons des formations continues en cours du soir pour les actifs souhaitant évoluer professionnellement." },
];
