import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

const updates = [
  {
    title: "Mission terrain – Afrique centrale",
    date: "2024",
    detail: "Distribution de protections, ateliers santé et rencontres avec 2 orphelinats partenaires."
  },
  {
    title: "Ateliers lycées – Île-de-France",
    date: "2024",
    detail: "3 lycées sensibilisés, 150 kits distribués, échanges avec infirmier·es scolaires."
  },
  {
    title: "Conférence université",
    date: "2023",
    detail: "Déconstruction des tabous sur le cycle menstruel, partage de ressources et témoignages."
  }
];

export default function ActualitesPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Badge tone="secondary">Actualités</Badge>
        <Title level={2}>Dernières actions et temps forts</Title>
        <Text tone="muted">
          Missions terrain, ateliers, conférences et événements clés de l’association Promesse.
        </Text>
      </header>

      <section className="card-grid">
        {updates.map((update) => (
          <Card key={update.title} title={update.title} actions={<Badge tone="neutral">{update.date}</Badge>}>
            {update.detail}
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Mission en images">
          <MediaPlaceholder label="Photos mission" tone="photo" aspect="4/3" />
        </Card>
        <Card title="Replay conférence">
          <MediaPlaceholder label="Vidéo replay" tone="video" />
        </Card>
        <Card title="Données récentes">
          <MediaPlaceholder label="Graphique actions" tone="chart" aspect="1/1" />
        </Card>
      </section>
    </div>
  );
}
