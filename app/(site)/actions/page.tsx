import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder, getAspectPaddingClass } from "@/components/ui/media-placeholder";
import { ResettableVideo } from "@/components/ui/resettable-video";
import { listPublishedMediaBySlotIds } from "@/lib/media";

const actionLinks = [
  {
    label: "Devenir bénévole",
    href: "mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Candidature%20b%C3%A9n%C3%A9vole",
    tone: "primary" as const
  },
  {
    label: "Devenir ambassadeur",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSfpV11Zy7iAWm4YgJvodHRykNP06vq2MlHToMOi7jet8x2NHw/viewform?fbclid=PARlRTSAQVLvpleHRuA2FlbQIxMABzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAaeSJQ6Y6AYi2mr6vjOrUNqZV8IpjdOVWGC4HqvuCE_fi2sdaT2IBfieBk4IhA_aem_-1sTrhv0DRkcL3nmRuWyag",
    tone: "secondary" as const,
    newTab: true
  },
  {
    label: "Accéder aux ressources",
    href: "/ressources",
    tone: "neutral" as const
  }
];

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
    ["actions.gallery_field_photo", "actions.gallery_workshop_video", "actions.gallery_impact_chart"]
  );

  const fieldPhotoSrc =
    mediaBySlot["actions.gallery_field_photo"]?.kind === "image"
      ? mediaBySlot["actions.gallery_field_photo"].url
      : "/actions/image-1.jpeg";
  const fieldPhotoAspect = mediaBySlot["actions.gallery_field_photo"]?.slotAspect ?? "1/1";
  const workshopVideoSrc =
    mediaBySlot["actions.gallery_workshop_video"]?.kind === "video"
      ? mediaBySlot["actions.gallery_workshop_video"].url
      : undefined;
  const workshopVideoAspect = mediaBySlot["actions.gallery_workshop_video"]?.slotAspect ?? "1/1";
  const impactChartSrc =
    mediaBySlot["actions.gallery_impact_chart"]?.kind === "image"
      ? mediaBySlot["actions.gallery_impact_chart"].url
      : undefined;
  const impactChartAspect = mediaBySlot["actions.gallery_impact_chart"]?.slotAspect ?? "1/1";

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
            {actionLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noreferrer noopener" : undefined}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded-full"
              >
                <Badge tone={link.tone} className="cursor-pointer transition-opacity hover:opacity-80">
                  {link.label}
                </Badge>
              </a>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Galerie terrain">
          <MediaPlaceholder
            src={fieldPhotoSrc}
            fallbackSrc="/actions/image-1.jpeg"
            label="Distribution protections"
            tone="photo"
            aspect={fieldPhotoAspect}
          />
        </Card>
        <Card title="Atelier éducatif">
          {workshopVideoSrc ? (
            <div
              className={`relative w-full overflow-hidden rounded-lg border border-border shadow-soft ${getAspectPaddingClass(workshopVideoAspect)}`}
            >
              <ResettableVideo
                src={workshopVideoSrc}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <MediaPlaceholder label="Sensibilisation cycle menstruel" tone="video" aspect={workshopVideoAspect} />
          )}
        </Card>
        <Card title="Impact visuel">
          <MediaPlaceholder src={impactChartSrc} label="Graphique interventions" tone="chart" aspect={impactChartAspect} />
        </Card>
      </section>
    </div>
  );
}
