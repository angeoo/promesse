import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { ResettableVideo } from "@/components/ui/resettable-video";
import { listPublishedMediaBySlotIds } from "@/lib/media";

const programmes = [
  {
    title: "Programme de formations : santé menstruelle",
    detail:
      "Distribution de protections, ateliers de sensibilisation, formations éducatives pour un accès équitable à l’information.",
    badge: "Éducation"
  },
  {
    title: "Programme Ambassadeur Promesse",
    detail:
      "Personnes engagées encadrées pour représenter l’association lors de missions humanitaires, notamment en Afrique.",
    badge: "Ambassadeurs"
  },
  {
    title: "Soutien aux orphelins",
    detail:
      "Partenariats avec des structures locales, accompagnement éducatif et matériel, programmes de parrainage.",
    badge: "Solidarité"
  }
];

export default async function ProgrammesPage() {
  const mediaBySlot = await listPublishedMediaBySlotIds(
    ["programmes.capsule", "programmes.training_photo", "programmes.impact_chart"],
    { includeSignedUrl: true, signedUrlExpiresInSeconds: 60 * 60 * 24 }
  );

  const capsuleMedia = mediaBySlot["programmes.capsule"];
  const trainingPhotoSrc =
    mediaBySlot["programmes.training_photo"]?.kind === "image"
      ? mediaBySlot["programmes.training_photo"].url
      : "/formations/image00002.jpeg";
  const impactChartSrc =
    mediaBySlot["programmes.impact_chart"]?.kind === "image"
      ? mediaBySlot["programmes.impact_chart"].url
      : undefined;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Title level={2}>Structurer l’impact, renforcer la lisibilité</Title>
        <Text tone="muted">
          Des programmes conçus pour durer : éducation menstruelle, ambassadeurs et parrainages
          soutiennent nos axes principaux.
        </Text>
      </header>

      <section className="card-grid">
        {programmes.map((program) => (
          <Card
            key={program.title}
            title={program.title}
            actions={<Badge tone="primary">{program.badge}</Badge>}
          >
            {program.detail}
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Capsules vidéo" actions={<Badge tone="neutral">À tourner</Badge>}>
          Vidéos courtes pour montrer le terrain, les ateliers et les formations. Un format pensé pour
          rassurer partenaires et bénéficiaires.
        </Card>
        <Card title="Kit Ambassadeur & gouvernance">
          <div className="flex flex-wrap gap-2">
            <Badge>Kit ambassadeur</Badge>
            <Badge tone="secondary">Charte de gouvernance</Badge>
          </div>
          <Text className="mt-2" tone="muted">
            Documents téléchargeables pour cadrer l’éthique, l’engagement et la transparence.
          </Text>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Capsule programmes">
          {capsuleMedia?.kind === "video" ? (
            <div className="relative w-full overflow-hidden rounded-lg border border-border shadow-soft pt-[56.25%]">
              <ResettableVideo
                src={capsuleMedia.url}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <MediaPlaceholder
              src={capsuleMedia?.kind === "image" ? capsuleMedia.url : "/formations/image00001.jpeg"}
              label="Formatrice promesse"
              tone="video"
            />
          )}
        </Card>
        <Card title="Formation terrain">
          <MediaPlaceholder src={trainingPhotoSrc} label="Photo atelier" tone="photo" aspect="4/3" />
        </Card>
        <Card title="Suivi impact">
          <MediaPlaceholder src={impactChartSrc} label="Graphique bénéficiaires" tone="chart" aspect="1/1" />
        </Card>
      </section>

      <Card title="Rejoindre un programme" actions={<Badge tone="secondary">Prioritaire</Badge>}>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Devenir ambassadeur</Button>
          <Button variant="secondary">Proposer un partenariat</Button>
          <Button variant="ghost">Demander une formation</Button>
        </div>
      </Card>
    </div>
  );
}
