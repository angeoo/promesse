import type { MediaKind } from "@/lib/media";

export type MediaAspectRatio = "16/9" | "4/3" | "1/1";

export type MediaSlot = {
  id: string;
  name: string;
  page: string;
  description: string;
  recommendedAspect: MediaAspectRatio;
  acceptedKinds: MediaKind[];
  fallback?: {
    kind: MediaKind;
    src?: string;
    label?: string;
    tone?: "photo" | "video" | "chart";
  };
};

export const MEDIA_SLOTS: MediaSlot[] = [
  {
    id: "home.hero_visual",
    name: "Accueil - Hero visuel",
    page: "Accueil",
    description: "Image principale du hero d'accueil.",
    recommendedAspect: "16/9",
    acceptedKinds: ["image"],
    fallback: { kind: "image", src: "/accueil/image-1.png", tone: "photo", label: "Hero accueil" }
  },
  {
    id: "home.gallery_video_main",
    name: "Accueil - Galerie vidéo principale",
    page: "Accueil",
    description: "Première carte vidéo de la section En images.",
    recommendedAspect: "16/9",
    acceptedKinds: ["video"],
    fallback: { kind: "video", src: "/accueil/f30c6134-8c9c-4403-af3b-8aa67e61c357.mp4", tone: "video", label: "Video principale" }
  },
  {
    id: "home.gallery_photo_workshop",
    name: "Accueil - Galerie photo atelier",
    page: "Accueil",
    description: "Deuxième carte de la section En images.",
    recommendedAspect: "4/3",
    acceptedKinds: ["image"],
    fallback: { kind: "image", src: "/accueil/image-2.jpeg", tone: "photo", label: "Atelier santé menstruelle" }
  },
  {
    id: "home.gallery_infographic",
    name: "Accueil - Galerie infographie",
    page: "Accueil",
    description: "Troisième carte de la section En images.",
    recommendedAspect: "1/1",
    acceptedKinds: ["image"],
    fallback: { kind: "image", tone: "chart", label: "Infographie impact" }
  },
  {
    id: "association.president_video",
    name: "Association - Mot de la présidente",
    page: "Association",
    description: "Vidéo de présentation sur la page Association.",
    recommendedAspect: "16/9",
    acceptedKinds: ["video"],
    fallback: { kind: "video", tone: "video", label: "Vidéo à intégrer" }
  },
  {
    id: "actions.gallery_field_photo",
    name: "Actions - Galerie terrain",
    page: "Actions",
    description: "Carte Galerie terrain.",
    recommendedAspect: "4/3",
    acceptedKinds: ["image"],
    fallback: { kind: "image", src: "/actions/image-1.jpeg", tone: "photo", label: "Distribution protections" }
  },
  {
    id: "actions.gallery_workshop_video",
    name: "Actions - Atelier éducatif vidéo",
    page: "Actions",
    description: "Carte Atelier éducatif.",
    recommendedAspect: "16/9",
    acceptedKinds: ["video"],
    fallback: { kind: "video", tone: "video", label: "Sensibilisation cycle menstruel" }
  },
  {
    id: "actions.gallery_impact_chart",
    name: "Actions - Impact visuel",
    page: "Actions",
    description: "Carte Impact visuel.",
    recommendedAspect: "1/1",
    acceptedKinds: ["image"],
    fallback: { kind: "image", tone: "chart", label: "Graphique interventions" }
  },
  {
    id: "programmes.capsule",
    name: "Programmes - Capsule programmes",
    page: "Programmes",
    description: "Carte Capsule programmes.",
    recommendedAspect: "16/9",
    acceptedKinds: ["image", "video"],
    fallback: { kind: "image", src: "/formations/image00001.jpeg", tone: "video", label: "Formatrice promesse" }
  },
  {
    id: "programmes.training_photo",
    name: "Programmes - Formation terrain",
    page: "Programmes",
    description: "Carte Formation terrain.",
    recommendedAspect: "4/3",
    acceptedKinds: ["image"],
    fallback: { kind: "image", src: "/formations/image00002.jpeg", tone: "photo", label: "Photo atelier" }
  },
  {
    id: "programmes.impact_chart",
    name: "Programmes - Suivi impact",
    page: "Programmes",
    description: "Carte Suivi impact.",
    recommendedAspect: "1/1",
    acceptedKinds: ["image"],
    fallback: { kind: "image", tone: "chart", label: "Graphique bénéficiaires" }
  },
  {
    id: "ressources.capsule_video",
    name: "Ressources - Capsule vidéo",
    page: "Ressources",
    description: "Carte Capsule vidéo.",
    recommendedAspect: "16/9",
    acceptedKinds: ["video"],
    fallback: { kind: "video", tone: "video", label: "Vidéo pédagogique" }
  },
  {
    id: "ressources.health_infographic",
    name: "Ressources - Infographie santé",
    page: "Ressources",
    description: "Carte Infographie santé.",
    recommendedAspect: "1/1",
    acceptedKinds: ["image"],
    fallback: { kind: "image", tone: "chart", label: "Infographie cycle" }
  },
  {
    id: "ressources.workshop_gallery",
    name: "Ressources - Galerie ateliers",
    page: "Ressources",
    description: "Carte Galerie ateliers.",
    recommendedAspect: "4/3",
    acceptedKinds: ["image"],
    fallback: { kind: "image", tone: "photo", label: "Photo atelier" }
  },
  {
    id: "s-engager.call_video",
    name: "S'engager - Vidéo d'appel",
    page: "S'engager",
    description: "Vidéo de mobilisation.",
    recommendedAspect: "16/9",
    acceptedKinds: ["video"],
    fallback: { kind: "video", tone: "video", label: "Vidéo engagement" }
  },
  {
    id: "partenariats.case_photo",
    name: "Partenariats - Cas partenaire photo",
    page: "Partenariats",
    description: "Carte Cas partenaire.",
    recommendedAspect: "4/3",
    acceptedKinds: ["image"],
    fallback: { kind: "image", tone: "photo", label: "Photo projet commun" }
  },
  {
    id: "partenariats.pitch_video",
    name: "Partenariats - Pitch vidéo",
    page: "Partenariats",
    description: "Carte Pitch vidéo.",
    recommendedAspect: "16/9",
    acceptedKinds: ["video"],
    fallback: { kind: "video", tone: "video", label: "Vidéo partenariat" }
  },
  {
    id: "partenariats.shared_impact_chart",
    name: "Partenariats - Impact partagé",
    page: "Partenariats",
    description: "Carte Impact partagé.",
    recommendedAspect: "1/1",
    acceptedKinds: ["image"],
    fallback: { kind: "image", tone: "chart", label: "Graphique impact" }
  },
  {
    id: "actualites.mission_photo",
    name: "Actualités - Mission en images",
    page: "Actualités",
    description: "Carte Mission en images.",
    recommendedAspect: "4/3",
    acceptedKinds: ["image"],
    fallback: { kind: "image", tone: "photo", label: "Photos mission" }
  },
  {
    id: "actualites.replay_video",
    name: "Actualités - Replay conférence",
    page: "Actualités",
    description: "Carte Replay conférence.",
    recommendedAspect: "16/9",
    acceptedKinds: ["video"],
    fallback: { kind: "video", tone: "video", label: "Vidéo replay" }
  },
  {
    id: "actualites.recent_data_chart",
    name: "Actualités - Données récentes",
    page: "Actualités",
    description: "Carte Données récentes.",
    recommendedAspect: "1/1",
    acceptedKinds: ["image"],
    fallback: { kind: "image", tone: "chart", label: "Graphique actions" }
  },
  ...Array.from({ length: 9 }, (_, index) => {
    const slotIndex = index + 1;
    const padded = String(slotIndex).padStart(2, "0");
    return {
      id: `contact.album.${padded}`,
      name: `Contact - Album terrain ${slotIndex}`,
      page: "Contact",
      description: `Image ${slotIndex} de l'album photo terrain.`,
      recommendedAspect: "4/3" as const,
      acceptedKinds: ["image"] as MediaKind[],
      fallback: {
        kind: "image" as const,
        src: `/dons/terrain/image000${padded}.jpeg`,
        tone: "photo" as const,
        label: `Photo terrain ${slotIndex}`
      }
    };
  })
];

export function getMediaSlotById(slotId: string) {
  return MEDIA_SLOTS.find((slot) => slot.id === slotId);
}

export function listMediaSlots() {
  return MEDIA_SLOTS;
}
