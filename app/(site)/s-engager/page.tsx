import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { ResettableVideo } from "@/components/ui/resettable-video";
import { listPublishedMediaBySlotIds } from "@/lib/media";

const options = [
  {
    title: "Devenir bénévole",
    detail: "Rejoindre les équipes terrain, logistique ou coordination des projets.",
    cta: "Je m’engage"
  },
  {
    title: "Devenir Ambassadeur Promesse",
    detail: "Représenter l’association lors de missions humanitaires et événements clés.",
    cta: "Candidater"
  },
  {
    title: "Faire un don",
    detail: "Financer les actions, soutenir les programmes et accompagner les bénéficiaires.",
    cta: "Donner maintenant"
  }
];

export default async function SEngagerPage() {
  const mediaBySlot = await listPublishedMediaBySlotIds(["s-engager.call_video"], {
    includeSignedUrl: true,
    signedUrlExpiresInSeconds: 60 * 60 * 24
  });
  const callVideoSrc =
    mediaBySlot["s-engager.call_video"]?.kind === "video"
      ? mediaBySlot["s-engager.call_video"].url
      : undefined;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Title level={2}>Promesse, c’est toi. C’est moi. C’est nous.</Title>
        <Text tone="muted">
          Engage-toi selon ton temps, tes compétences ou tes moyens. Chaque geste compte pour celles et
          ceux que nous accompagnons.
        </Text>
      </header>

      <section className="card-grid">
        {options.map((opt) => (
          <Card key={opt.title} title={opt.title} actions={<Badge tone="primary">Action</Badge>}>
            <Text tone="muted">{opt.detail}</Text>
            <div className="pt-3">
              <Button>{opt.cta}</Button>
            </div>
          </Card>
        ))}
      </section>

      <Card title="Vidéo d’appel à l’engagement" actions={<Badge tone="neutral">À filmer</Badge>}>
        <Text tone="muted">
          Une vidéo majeure pour montrer les visages, les actions et le pourquoi. Objectif : donner
          envie de s’impliquer et de passer à l’action.
        </Text>
        <div className="pt-3">
          {callVideoSrc ? (
            <div className="relative w-full overflow-hidden rounded-lg border border-border shadow-soft pt-[56.25%]">
              <ResettableVideo
                src={callVideoSrc}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <MediaPlaceholder label="Vidéo engagement" tone="video" />
          )}
        </div>
      </Card>
    </div>
  );
}
