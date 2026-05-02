import campus from "@/assets/campus-building.jpg";
import hero from "@/assets/hero-classroom.jpg";
import library from "@/assets/library-study.jpg";
import professor from "@/assets/professor-teaching.jpg";
import students from "@/assets/students-group.jpg";
import graduation from "@/assets/graduation.jpg";

export type GalleryItem = {
  id: string;
  title: string;
  caption: string;
  image_url: string;
};

// Galerie photos — modifiez ce tableau pour changer les images affichées
export const galleryItems: GalleryItem[] = [
  { id: "1", title: "Campus ESAGE", caption: "Notre bâtiment principal à Niamey", image_url: campus },
  { id: "2", title: "Salle de classe", caption: "Cours interactifs en effectifs réduits", image_url: hero },
  { id: "3", title: "Bibliothèque", caption: "Espace d'étude et de recherche", image_url: library },
  { id: "4", title: "Enseignants", caption: "Professionnels en activité et enseignants permanents", image_url: professor },
  { id: "5", title: "Vie étudiante", caption: "Une communauté dynamique et solidaire", image_url: students },
  { id: "6", title: "Cérémonie de remise des diplômes", caption: "La réussite au bout de l'effort", image_url: graduation },
];
