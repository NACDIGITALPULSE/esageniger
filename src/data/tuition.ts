export type TuitionTier = {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  is_highlight: boolean;
};

export const tuitionTiers: TuitionTier[] = [
  {
    id: "bts",
    title: "BTS d'État",
    price: "350 000",
    duration: "2 ans",
    description: "Brevet de Technicien Supérieur — Diplôme d'État",
    is_highlight: false,
    features: [
      "6 filières professionnalisantes",
      "Stages en entreprise",
      "Diplôme d'État reconnu",
      "Paiement en 3 tranches",
    ],
  },
  {
    id: "licence",
    title: "Licence",
    price: "450 000",
    duration: "3 ans (ou 1 an après BTS)",
    description: "Études supérieures spécialisées",
    is_highlight: true,
    features: [
      "9 spécialisations",
      "Enseignants professionnels",
      "Cours du jour et du soir",
      "Paiement en 3 tranches",
    ],
  },
  {
    id: "master",
    title: "Master",
    price: "700 000",
    duration: "2 ans après Licence",
    description: "Niveau supérieur de spécialisation",
    is_highlight: false,
    features: [
      "Expertise approfondie",
      "Mémoire de fin d'études",
      "Réseau professionnel",
      "Paiement en 3 tranches",
    ],
  },
];
