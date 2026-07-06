import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder, getAspectPaddingClass } from "@/components/ui/media-placeholder";
import { ResettableVideo } from "@/components/ui/resettable-video";
import { FichesPdfList } from "@/components/ui/fiches-pdf-list";
import { listPublishedMediaBySlotIds } from "@/lib/media";

const CHARTE_DEFINITIONS = [
  { label: "Charte de programme de formation santé menstruelle", slotId: "programmes.charte_formation_sante_menstruelle" },
  { label: "Charte de programme ambassadeur Promesse", slotId: "programmes.charte_ambassadeur" },
  { label: "Charte de programme de parrainage", slotId: "programmes.charte_parrainage" }
] as const;

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
    title: "Programme de parrainage des orphelins",
    detail:
      "Partenariats avec des structures locales, accompagnement éducatif et matériel, programmes de parrainage.",
    badge: "Solidarité"
  }
];

export default async function ProgrammesPage() {
  const mediaBySlot = await listPublishedMediaBySlotIds([
    "programmes.capsule",
    "programmes.training_photo",
    "programmes.impact_chart",
    ...CHARTE_DEFINITIONS.map((c) => c.slotId)
  ]);

  const capsuleMedia = mediaBySlot["programmes.capsule"];
  const capsuleAspect = capsuleMedia?.slotAspect ?? "1/1";
  const capsuleContentType = capsuleMedia?.contentType;
  const trainingPhotoSrc =
    mediaBySlot["programmes.training_photo"]?.kind === "image"
      ? mediaBySlot["programmes.training_photo"].url
      : "/formations/image00002.jpeg";
  const trainingPhotoAspect = "1/1";
  const impactChartSrc =
    mediaBySlot["programmes.impact_chart"]?.kind === "image"
      ? mediaBySlot["programmes.impact_chart"].url
      : undefined;
  const impactChartAspect = "1/1";

  const charteItems = CHARTE_DEFINITIONS.map((c) => {
    const media = mediaBySlot[c.slotId];
    return {
      label: c.label,
      url: media?.kind === "document" ? media.url : undefined
    };
  });

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
        <Card title="Chartes de nos programmes">
          <FichesPdfList items={charteItems} />
          <Text className="mt-2 text-sm" tone="muted">
            Documents téléchargeables pour cadrer l’éthique, l’engagement et la transparence.
          </Text>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Capsule programmes">
          {capsuleMedia?.kind === "video" ? (
            <div
              className={`relative w-full overflow-hidden rounded-lg border border-border shadow-soft ${getAspectPaddingClass(capsuleAspect)}`}
            >
              <ResettableVideo
                src={capsuleMedia.url}
                contentType={capsuleContentType}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <MediaPlaceholder
              src={capsuleMedia?.kind === "image" ? capsuleMedia.url : "/formations/image00001.jpeg"}
              fallbackSrc="/formations/image00001.jpeg"
              label="Formatrice promesse"
              tone="video"
              aspect={capsuleAspect}
            />
          )}
        </Card>
        <Card title="Formation terrain">
          <MediaPlaceholder
            src={trainingPhotoSrc}
            fallbackSrc="/formations/image00002.jpeg"
            label="Photo atelier"
            tone="photo"
            aspect={trainingPhotoAspect}
          />
        </Card>
        <Card title="Suivi impact">
          <MediaPlaceholder src={impactChartSrc} label="Graphique bénéficiaires" tone="chart" aspect={impactChartAspect} />
        </Card>
      </section>

      <Card
        title="Rejoindre un programme"
        className="text-center"
        headerClassName="justify-center"
        titleClassName="w-full text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <Button
            href="https://docs.google.com/forms/d/e/1FAIpQLSfpV11Zy7iAWm4YgJvodHRykNP06vq2MlHToMOi7jet8x2NHw/viewform?fbclid=PARlRTSAQVLvpleHRuA2FlbQIxMABzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAaeSJQ6Y6AYi2mr6vjOrUNqZV8IpjdOVWGC4HqvuCE_fi2sdaT2IBfieBk4IhA_aem_-1sTrhv0DRkcL3nmRuWyag"
            newTab
          >
            Devenir ambassadeur
          </Button>
          <Button
            variant="secondary"
            href="mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Proposition%20de%20partenariat"
          >
            Proposer un partenariat
          </Button>
          <Button
            variant="ghost"
            href="mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Demande%20de%20formation"
          >
            Demander une formation
          </Button>
        </div>
      </Card>
    </div>
  );
}
