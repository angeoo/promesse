import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

export default function ActualitesPage() {
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
