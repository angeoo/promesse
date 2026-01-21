import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

const fiches = [
  "Cycle menstruel",
  "Hygiène menstruelle",
  "Mythes et réalités",
  "Santé et prévention"
];

export default function RessourcesPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Title level={2}>Informer, outiller, partager</Title>
        <Text tone="muted">
          Fiches, vidéos et supports pédagogiques pour mieux comprendre le cycle menstruel et agir en
          milieu éducatif.
        </Text>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Fiches éducatives" actions={<Badge tone="primary">Téléchargeable</Badge>}>
          <ul className="list-disc pl-4 text-foreground/80">
            {fiches.map((fiche) => (
              <li key={fiche}>{fiche}</li>
            ))}
          </ul>
        </Card>
        <Card title="Vidéos pédagogiques" actions={<Badge tone="secondary">À filmer</Badge>}>
          Vidéos courtes pour expliquer l’éducation menstruelle et son importance. Formats prêts pour
          site et réseaux.
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Capsule vidéo">
          <MediaPlaceholder label="Vidéo pédagogique" tone="video" />
        </Card>
        <Card title="Infographie santé">
          <MediaPlaceholder label="Infographie cycle" tone="chart" aspect="1/1" />
        </Card>
        <Card title="Galerie ateliers">
          <MediaPlaceholder label="Photo atelier" tone="photo" aspect="4/3" />
        </Card>
      </section>

      <Card title="Ressources pour éducateurs" actions={<Badge tone="neutral">Interventions</Badge>}>
        <Text>
          Outils pédagogiques et programmes d’intervention pour écoles, universités et structures
          souhaitant agir sur ces enjeux. Nous pouvons intervenir sur site.
        </Text>
        <div className="flex flex-wrap gap-3 pt-3">
          <Button>Planifier une intervention</Button>
          <Button variant="secondary">Obtenir les supports</Button>
          <Button variant="ghost">Voir les programmes</Button>
        </div>
      </Card>
    </div>
  );
}
