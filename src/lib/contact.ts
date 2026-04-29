export const ESAGE = {
  name: "ESAGE",
  fullName: "École Supérieure d'Administration et de Gestion des Entreprises",
  slogan: "Travail – Rigueur – Succès",
  subSlogan: "La réussite au bout de l'effort",
  tagline: "Notre choix, notre assurance en l'avenir",
  address: "2ème rond-point Wadata, route Filingué (vers Jangorzo), Niamey, Niger",
  phones: ["+227 96 87 67 17"],
  email: "esageniger@hotmail.com",
  whatsapp: "22796876717", // E.164 without +
} as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${ESAGE.whatsapp}?text=${encodeURIComponent(message)}`;
}
