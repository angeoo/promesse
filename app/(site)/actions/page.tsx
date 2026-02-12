import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

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

export default function ActionsPage() {
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
          <MediaPlaceholder src="/actions/image-1.jpeg" label="Distribution protections" tone="photo" aspect="4/3" />
        </Card>
        <Card title="Atelier éducatif">
          <MediaPlaceholder label="Sensibilisation cycle menstruel" tone="video" />
        </Card>
        <Card title="Impact visuel">
          <MediaPlaceholder label="Graphique interventions" tone="chart" aspect="1/1" />
        </Card>
      </section>
    </div>
  );
}
