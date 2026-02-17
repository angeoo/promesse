import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { listPublishedMediaBySlotIds } from "@/lib/media";

export default async function ActualitesPage() {
  const mediaBySlot = await listPublishedMediaBySlotIds(
    ["actualites.mission_photo", "actualites.replay_video", "actualites.recent_data_chart"],
    { includeSignedUrl: true, signedUrlExpiresInSeconds: 60 * 60 * 24 }
  );
  const missionPhotoSrc =
    mediaBySlot["actualites.mission_photo"]?.kind === "image"
      ? mediaBySlot["actualites.mission_photo"].url
      : undefined;
  const replayVideoSrc =
    mediaBySlot["actualites.replay_video"]?.kind === "video"
      ? mediaBySlot["actualites.replay_video"].url
      : undefined;
  const recentDataChartSrc =
    mediaBySlot["actualites.recent_data_chart"]?.kind === "image"
      ? mediaBySlot["actualites.recent_data_chart"].url
      : undefined;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Title level={2}>Dernières actions et temps forts</Title>
        <Text tone="muted">
          Espace réservé pour les prochaines actualités : missions, ateliers, conférences et temps forts.
        </Text>
      </header>

      <section className="card-grid">
        <Card title="Actualité à venir" actions={<Badge tone="neutral">Date</Badge>}>
          <Text tone="muted">À compléter</Text>
        </Card>
        <Card title="Actualité à venir" actions={<Badge tone="neutral">Date</Badge>}>
          <Text tone="muted">À compléter</Text>
        </Card>
        <Card title="Actualité à venir" actions={<Badge tone="neutral">Date</Badge>}>
          <Text tone="muted">À compléter</Text>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Mission en images">
          <MediaPlaceholder src={missionPhotoSrc} label="Photos mission" tone="photo" aspect="4/3" />
        </Card>
        <Card title="Replay conférence">
          {replayVideoSrc ? (
            <div className="relative w-full overflow-hidden rounded-lg border border-border shadow-soft pt-[56.25%]">
              <video src={replayVideoSrc} controls className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ) : (
            <MediaPlaceholder label="Vidéo replay" tone="video" />
          )}
        </Card>
        <Card title="Données récentes">
          <MediaPlaceholder src={recentDataChartSrc} label="Graphique actions" tone="chart" aspect="1/1" />
        </Card>
      </section>
    </div>
  );
}
