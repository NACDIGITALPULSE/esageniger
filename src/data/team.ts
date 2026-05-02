export type TeamMember = {
  id: string;
  full_name: string;
  role_title: string;
  bio: string | null;
  photo_url: string | null;
};

// Équipe ESAGE — modifiez ce tableau pour changer les membres affichés sur le site
export const teamMembers: TeamMember[] = [
  {
    id: "1",
    full_name: "Direction Générale",
    role_title: "Directeur Général",
    bio: "Plus de 20 ans d'expérience dans l'enseignement supérieur et la gestion d'établissements éducatifs au Niger.",
    photo_url: null,
  },
  {
    id: "2",
    full_name: "Direction des Études",
    role_title: "Directrice des Études",
    bio: "Coordination des programmes pédagogiques et suivi de la qualité de l'enseignement.",
    photo_url: null,
  },
  {
    id: "3",
    full_name: "Service des Admissions",
    role_title: "Responsable Admissions",
    bio: "Accompagnement personnalisé des candidats tout au long de leur processus d'inscription.",
    photo_url: null,
  },
];
