import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder, getAspectPaddingClass } from "@/components/ui/media-placeholder";
import { ResettableVideo } from "@/components/ui/resettable-video";
import { listPublishedMediaBySlotIds } from "@/lib/media";

const fiches = [
  "Cycle menstruel",
  "Hygiène menstruelle",
  "Mythes et réalités",
  "Santé et prévention"
];

export default async function RessourcesPage() {
  let mediaBySlot = {} as Awaited<ReturnType<typeof listPublishedMediaBySlotIds>>;
  try {
    mediaBySlot = await listPublishedMediaBySlotIds(
      ["ressources.capsule_video", "ressources.health_infographic", "ressources.workshop_gallery"]
    );
  } catch {
    mediaBySlot = {};
  }

  const capsuleVideoSrc =
    mediaBySlot["ressources.capsule_video"]?.kind === "video"
      ? mediaBySlot["ressources.capsule_video"].url
      : undefined;
  const capsuleVideoAspect = mediaBySlot["ressources.capsule_video"]?.slotAspect ?? "1/1";
  const capsuleVideoContentType = mediaBySlot["ressources.capsule_video"]?.contentType;
  const infographicSrc =
    mediaBySlot["ressources.health_infographic"]?.kind === "image"
      ? mediaBySlot["ressources.health_infographic"].url
      : undefined;
  const infographicAspect = mediaBySlot["ressources.health_infographic"]?.slotAspect ?? "1/1";
  const workshopSrc =
    mediaBySlot["ressources.workshop_gallery"]?.kind === "image"
      ? mediaBySlot["ressources.workshop_gallery"].url
      : undefined;
  const workshopAspect = mediaBySlot["ressources.workshop_gallery"]?.slotAspect ?? "1/1";

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Title level={2}>Informer, outiller, partager</Title>
        <Text tone="muted">
          Fiches, vidéos et supports pédagogiques pour mieux comprendre le cycle menstruel et agir en
          milieu éducatif.
        </Text>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Fiches éducatives" actions={<Badge tone="primary">Téléchargeable</Badge>}>
          <ul className="list-disc pl-4 text-foreground/80">
            {fiches.map((fiche) => (
              <li key={fiche}>{fiche}</li>
            ))}
          </ul>
        </Card>
        <Card title="Vidéos pédagogiques" actions={<Badge tone="secondary">À filmer</Badge>}>
          Vidéos courtes pour expliquer l’éducation menstruelle et son importance. Formats prêts pour
          site et réseaux.
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Capsule vidéo">
          {capsuleVideoSrc ? (
            <div
              className={`relative w-full overflow-hidden rounded-lg border border-border shadow-soft ${getAspectPaddingClass(capsuleVideoAspect)}`}
            >
              <ResettableVideo
                src={capsuleVideoSrc}
                contentType={capsuleVideoContentType}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <MediaPlaceholder label="Vidéo pédagogique" tone="video" aspect={capsuleVideoAspect} />
          )}
        </Card>
        <Card title="Infographie santé">
          <MediaPlaceholder src={infographicSrc} alt="Infographie cycle" label="Infographie cycle" tone="chart" aspect={infographicAspect} />
        </Card>
        <Card title="Galerie ateliers">
          <MediaPlaceholder src={workshopSrc} alt="Photo atelier" label="Photo atelier" tone="photo" aspect={workshopAspect} />
        </Card>
      </section>

      <Card title="Ressources pour éducateurs" actions={<Badge tone="neutral">Interventions</Badge>}>
        <Text>
          Outils pédagogiques et programmes d’intervention pour écoles, universités et structures
          souhaitant agir sur ces enjeux. Nous pouvons intervenir sur site.
        </Text>
        <div className="flex flex-wrap gap-3 pt-3">
          <Button
            href="mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Demande%20d%27intervention"
          >
            Planifier une intervention
          </Button>
          <Button
            variant="secondary"
            href="mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Demande%20de%20supports%20%C3%A9ducatifs"
          >
            Obtenir les supports
          </Button>
          <Button variant="ghost" href="/programmes">
            Voir les programmes
          </Button>
        </div>
      </Card>
    </div>
  );
}
