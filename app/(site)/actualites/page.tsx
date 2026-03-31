import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder, getAspectPaddingClass } from "@/components/ui/media-placeholder";
import { ResettableVideo } from "@/components/ui/resettable-video";
import { listPublishedMediaBySlotIds } from "@/lib/media";

export default async function ActualitesPage() {
  const mediaBySlot = await listPublishedMediaBySlotIds(
    ["actualites.mission_photo", "actualites.replay_video", "actualites.recent_data_chart"]
  );
  const missionPhotoSrc =
    mediaBySlot["actualites.mission_photo"]?.kind === "image"
      ? mediaBySlot["actualites.mission_photo"].url
      : undefined;
  const missionPhotoAspect = mediaBySlot["actualites.mission_photo"]?.slotAspect ?? "1/1";
  const replayVideoSrc =
    mediaBySlot["actualites.replay_video"]?.kind === "video"
      ? mediaBySlot["actualites.replay_video"].url
      : undefined;
  const replayVideoAspect = mediaBySlot["actualites.replay_video"]?.slotAspect ?? "16/9";
  const replayVideoContentType = mediaBySlot["actualites.replay_video"]?.contentType;
  const recentDataChartSrc =
    mediaBySlot["actualites.recent_data_chart"]?.kind === "image"
      ? mediaBySlot["actualites.recent_data_chart"].url
      : undefined;
  const recentDataChartAspect = mediaBySlot["actualites.recent_data_chart"]?.slotAspect ?? "1/1";

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
          <MediaPlaceholder src={missionPhotoSrc} label="Photos mission" tone="photo" aspect={missionPhotoAspect} />
        </Card>
        <Card title="Replay conférence">
          {replayVideoSrc ? (
            <div
              className={`relative w-full overflow-hidden rounded-lg border border-border shadow-soft ${getAspectPaddingClass(replayVideoAspect)}`}
            >
              <ResettableVideo
                src={replayVideoSrc}
                contentType={replayVideoContentType}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <MediaPlaceholder label="Vidéo replay" tone="video" aspect={replayVideoAspect} />
          )}
        </Card>
        <Card title="Données récentes">
          <MediaPlaceholder src={recentDataChartSrc} label="Graphique actions" tone="chart" aspect={recentDataChartAspect} />
        </Card>
      </section>
    </div>
  );
}
