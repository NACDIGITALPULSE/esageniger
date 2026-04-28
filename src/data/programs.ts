export type Program = {
  id: string;
  title: string;
  level: "BTS" | "Licence/Master";
  description: string;
};

export const btsPrograms: Program[] = [
  { id: "bts-cge", level: "BTS", title: "Comptabilité et Gestion des Entreprises", description: "Maîtrisez la comptabilité, la fiscalité et la gestion financière des entreprises." },
  { id: "bts-gc", level: "BTS", title: "Gestion Commerciale", description: "Devenez expert en stratégies de vente, négociation et relation client." },
  { id: "bts-fb", level: "BTS", title: "Finance Banque", description: "Formez-vous aux métiers de la banque, du crédit et de la finance d'entreprise." },
  { id: "bts-ce", level: "BTS", title: "Communication des Entreprises", description: "Concevez et pilotez la communication interne et externe des organisations." },
  { id: "bts-ago", level: "BTS", title: "Administration et Gestion des Organisations (PMO/GRH)", description: "Pilotez les ressources humaines et l'organisation des structures." },
  { id: "bts-sd", level: "BTS", title: "Secrétariat de Direction", description: "Devenez le bras droit indispensable des dirigeants et cadres supérieurs." },
];

export const licenceMasterPrograms: Program[] = [
  { id: "lm-cg", level: "Licence/Master", title: "Comptabilité et Gestion (Finance Comptabilité)", description: "Approfondissez vos compétences en finance d'entreprise et audit." },
  { id: "lm-gcm", level: "Licence/Master", title: "Gestion Commerciale et Marketing", description: "Stratégie marketing, études de marché et management commercial." },
  { id: "lm-fb", level: "Licence/Master", title: "Finance Banque", description: "Spécialisez-vous dans la finance de marché et la gestion bancaire." },
  { id: "lm-aa", level: "Licence/Master", title: "Administration des Affaires", description: "Devenez un cadre polyvalent capable de diriger des organisations complexes." },
  { id: "lm-grh", level: "Licence/Master", title: "Gestion des Ressources Humaines", description: "Pilotez le capital humain : recrutement, formation, paie et développement." },
  { id: "lm-adb", level: "Licence/Master", title: "Assistant de Direction Bilingue", description: "Assistez la direction générale dans un environnement bilingue." },
  { id: "lm-gct", level: "Licence/Master", title: "Gestion des Collectivités Territoriales", description: "Maîtrisez l'administration et la gestion des collectivités locales." },
  { id: "lm-fis", level: "Licence/Master", title: "Fiscalité", description: "Devenez expert des systèmes fiscaux nationaux et internationaux." },
  { id: "lm-adm", level: "Licence/Master", title: "Administration", description: "Formation supérieure aux fonctions d'administration publique et privée." },
];

export const allPrograms: Program[] = [...btsPrograms, ...licenceMasterPrograms];
