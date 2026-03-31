import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder, getAspectPaddingClass } from "@/components/ui/media-placeholder";
import { ResettableVideo } from "@/components/ui/resettable-video";
import { listPublishedMediaBySlotIds } from "@/lib/media";

const partenariats = [
  {
    title: "Co-construction de projets",
    detail: "Imaginer et déployer des actions solidaires durables avec vos équipes et réseaux."
  },
  {
    title: "Mécénat & dons",
    detail: "Soutien financier ou en nature pour renforcer les programmes et l’impact terrain."
  },
  {
    title: "Interventions & sensibilisation",
    detail: "Ateliers en entreprise, conférences et actions de sensibilisation pour vos collaborateurs."
  }
];

export default async function PartenariatsPage() {
  const mediaBySlot = await listPublishedMediaBySlotIds(
    ["partenariats.case_photo", "partenariats.pitch_video", "partenariats.shared_impact_chart"]
  );
  const casePhotoSrc =
    mediaBySlot["partenariats.case_photo"]?.kind === "image"
      ? mediaBySlot["partenariats.case_photo"].url
      : undefined;
  const casePhotoAspect = mediaBySlot["partenariats.case_photo"]?.slotAspect ?? "1/1";
  const pitchVideoSrc =
    mediaBySlot["partenariats.pitch_video"]?.kind === "video"
      ? mediaBySlot["partenariats.pitch_video"].url
      : undefined;
  const pitchVideoAspect = mediaBySlot["partenariats.pitch_video"]?.slotAspect ?? "16/9";
  const pitchVideoContentType = mediaBySlot["partenariats.pitch_video"]?.contentType;
  const impactChartSrc =
    mediaBySlot["partenariats.shared_impact_chart"]?.kind === "image"
      ? mediaBySlot["partenariats.shared_impact_chart"].url
      : undefined;
  const impactChartAspect = mediaBySlot["partenariats.shared_impact_chart"]?.slotAspect ?? "1/1";

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Title level={2}>Construire un impact social durable</Title>
        <Text tone="muted">
          Ensemble, nous pouvons amplifier les actions de Promesse : éducation menstruelle, dons,
          programmes de parrainage et soutien aux orphelins.
        </Text>
      </header>

      <section className="card-grid">
        {partenariats.map((item) => (
          <Card key={item.title} title={item.title}>
            {item.detail}
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Cas partenaire">
          <MediaPlaceholder src={casePhotoSrc} label="Photo projet commun" tone="photo" aspect={casePhotoAspect} />
        </Card>
        <Card title="Pitch vidéo">
          {pitchVideoSrc ? (
            <div
              className={`relative w-full overflow-hidden rounded-lg border border-border shadow-soft ${getAspectPaddingClass(pitchVideoAspect)}`}
            >
              <ResettableVideo
                src={pitchVideoSrc}
                contentType={pitchVideoContentType}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <MediaPlaceholder label="Vidéo partenariat" tone="video" aspect={pitchVideoAspect} />
          )}
        </Card>
        <Card title="Impact partagé">
          <MediaPlaceholder src={impactChartSrc} label="Graphique impact" tone="chart" aspect={impactChartAspect} />
        </Card>
      </section>

      <Card title="Prendre contact" actions={<Badge tone="secondary">On avance</Badge>}>
        <Text tone="muted">
          Discutons de vos priorités, de vos publics et des formats les plus efficaces. Nous mettons un
          point d’honneur à la transparence et à la mesure d’impact.
        </Text>
        <div className="flex flex-wrap gap-3 pt-3">
          <Button href="mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Demande%20d%27%C3%A9change">
            Échanger
          </Button>
          <Button
            variant="secondary"
            href="mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Proposition%20de%20partenariat"
          >
            Proposer un projet
          </Button>
          <Button variant="ghost" href="/programmes">
            Voir nos programmes
          </Button>
        </div>
      </Card>
    </div>
  );
}
