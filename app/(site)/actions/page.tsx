import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { listPublishedMediaBySlotIds } from "@/lib/media";

const actions = [
  {
    title: "Distributions essentielles",
    detail: "Protections hygiéniques, kits de dignité, accompagnement des publics vulnérables."
  },
  {
    title: "Ateliers éducatifs",
    detail: "Sensibilisation au cycle menstruel, santé et prévention, ateliers d’autonomie."
  },
  {
    title: "Maraudes & proximité",
    detail: "Présence sur le terrain pour écouter, aider et connecter avec des partenaires locaux."
  },
  {
    title: "Événements et conférences",
    detail: "Stands, prises de parole et formations pour briser les tabous et mobiliser."
  }
];

export default async function ActionsPage() {
  const mediaBySlot = await listPublishedMediaBySlotIds(
    ["actions.gallery_field_photo", "actions.gallery_workshop_video", "actions.gallery_impact_chart"],
    { includeSignedUrl: true, signedUrlExpiresInSeconds: 60 * 60 * 24 }
  );

  const fieldPhotoSrc =
    mediaBySlot["actions.gallery_field_photo"]?.kind === "image"
      ? mediaBySlot["actions.gallery_field_photo"].url
      : "/actions/image-1.jpeg";
  const workshopVideoSrc =
    mediaBySlot["actions.gallery_workshop_video"]?.kind === "video"
      ? mediaBySlot["actions.gallery_workshop_video"].url
      : undefined;
  const impactChartSrc =
    mediaBySlot["actions.gallery_impact_chart"]?.kind === "image"
      ? mediaBySlot["actions.gallery_impact_chart"].url
      : undefined;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Title level={2}>Impact terrain et sensibilisation</Title>
        <Text tone="muted">
          Promesse agit concrètement : distributions, ateliers éducatifs, maraudes et événements
          permettent de répondre aux besoins identifiés et de mobiliser durablement.
        </Text>
      </header>

      <section className="card-grid">
        {actions.map((action) => (
          <Card key={action.title} title={action.title}>
            {action.detail}
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Chiffres clés">
          <ul className="space-y-2 text-foreground/80">
            <li>• Association créée en 2022</li>
            <li>• 400+ protections distribuées</li>
            <li>• 10+ interventions</li>
            <li>• Actions en France et en Afrique</li>
          </ul>
        </Card>
        <Card title="Appels à l’action" actions={<Badge tone="secondary">On agit</Badge>}>
          <div className="flex flex-wrap gap-2">
            <Badge>Devenir bénévole</Badge>
            <Badge tone="secondary">Devenir ambassadeur</Badge>
            <Badge tone="neutral">Accéder aux ressources</Badge>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Galerie terrain">
          <MediaPlaceholder src={fieldPhotoSrc} label="Distribution protections" tone="photo" aspect="4/3" />
        </Card>
        <Card title="Atelier éducatif">
          {workshopVideoSrc ? (
            <div className="relative w-full overflow-hidden rounded-lg border border-border shadow-soft pt-[56.25%]">
              <video src={workshopVideoSrc} controls className="absolute inset-0 h-full w-full object-cover" />
            </div>
          ) : (
            <MediaPlaceholder label="Sensibilisation cycle menstruel" tone="video" />
          )}
        </Card>
        <Card title="Impact visuel">
          <MediaPlaceholder src={impactChartSrc} label="Graphique interventions" tone="chart" aspect="1/1" />
        </Card>
      </section>
    </div>
  );
}
