import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

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

export default function PartenariatsPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Badge>Partenariats</Badge>
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
          <MediaPlaceholder label="Photo projet commun" tone="photo" aspect="4/3" />
        </Card>
        <Card title="Pitch vidéo">
          <MediaPlaceholder label="Vidéo partenariat" tone="video" />
        </Card>
        <Card title="Impact partagé">
          <MediaPlaceholder label="Graphique impact" tone="chart" aspect="1/1" />
        </Card>
      </section>

      <Card title="Prendre contact" actions={<Badge tone="secondary">On avance</Badge>}>
        <Text tone="muted">
          Discutons de vos priorités, de vos publics et des formats les plus efficaces. Nous mettons un
          point d’honneur à la transparence et à la mesure d’impact.
        </Text>
        <div className="flex flex-wrap gap-3 pt-3">
          <Button>Échanger</Button>
          <Button variant="secondary">Proposer un projet</Button>
          <Button variant="ghost">Voir nos programmes</Button>
        </div>
      </Card>
    </div>
  );
}
