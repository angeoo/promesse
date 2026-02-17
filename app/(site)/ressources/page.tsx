import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { listMediaAssets } from "@/lib/media";

const fiches = [
  "Cycle menstruel",
  "Hygiène menstruelle",
  "Mythes et réalités",
  "Santé et prévention"
];

export default async function RessourcesPage() {
  let media = [] as Awaited<ReturnType<typeof listMediaAssets>>;
  try {
    media = await listMediaAssets({
      limit: 6,
      publishedOnly: true,
      includeSignedUrl: true,
      signedUrlExpiresInSeconds: 60 * 60 * 24
    });
  } catch {
    media = [];
  }

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

      {media.length > 0 ? (
        <section className="grid gap-6 md:grid-cols-3">
          {media.map((item) => (
            <Card key={item.id} title={item.title}>
              <div className="overflow-hidden rounded-md border border-border bg-surface">
                {item.kind === "video" ? (
                  <video src={item.url} controls className="h-auto w-full" />
                ) : (
                  <img src={item.url} alt={item.title} className="h-auto w-full object-cover" />
                )}
              </div>
              {item.description ? (
                <Text tone="muted" className="pt-3">
                  {item.description}
                </Text>
              ) : null}
            </Card>
          ))}
        </section>
      ) : (
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
      )}

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
