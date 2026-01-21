import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

const stats = [
  { label: "Protections distribuées", value: "400+" },
  { label: "Interventions", value: "10+" },
  { label: "Zones d’action", value: "France & Afrique" }
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-14">
      <section className="grid gap-10 md:grid-cols-2 items-center">
        <div className="flex flex-col gap-4">
          <Title level={1}>
            Promesse, c’est toi, c’est moi, c’est nous. Mais c’est surtout pour eux.
          </Title>
          <Text tone="muted">
            Promesse est une association créée en Septembre 2022, engagée dans l’éducation et la sensibilisation,
l’information sur le cycle menstruel, la lutte contre la précarité menstruelle à travers des actions de
dons, ainsi que l’aide aux orphelins et les programmes de parrainage
          </Text>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Devenir bénévole</Button>
            <Button variant="secondary" size="lg">
              Faire un don
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-4 text-center">
                <p className="text-2xl font-heading font-semibold text-foreground">{stat.value}</p>
                <p className="text-sm text-foreground/70">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-6 rounded-3xl bg-primary/10 blur-2xl" aria-hidden />
          <Card className="relative overflow-hidden p-0 h-full">
            <div
              className="h-full min-h-[340px] w-full bg-gradient-to-br from-primary via-secondary to-accent opacity-90"
              role="img"
              aria-label="Illustration des actions solidaires de l'association Promesse"
            />
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Title level={2}>Nos axes d’impact</Title>
            <Text tone="muted">Éducation, dons, accompagnement sur le terrain.</Text>
          </div>
        </div>
        <div className="card-grid">
          <Card title="Éducation & sensibilisation">
            Promouvoir la santé menstruelle, briser les tabous et transmettre des ressources claires,
            accessibles et actionnables.
          </Card>
          <Card title="Lutte contre la précarité menstruelle">
            Collecte et distribution de protections, accompagnement des publics vulnérables, ateliers
            d’autonomie.
          </Card>
          <Card title="Soutien aux orphelins">
            Programmes de parrainage, actions humanitaires sur le terrain, soutien aux structures
            éducatives.
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Title level={2}>En images</Title>
          <Badge tone="secondary">Photos & vidéos à venir</Badge>
        </div>
        <div className="card-grid">
          <MediaPlaceholder label="Reportage terrain (vidéo)" tone="video" />
          <MediaPlaceholder label="Atelier santé menstruelle" tone="photo" aspect="4/3" />
          <MediaPlaceholder label="Infographie impact" tone="chart" aspect="1/1" />
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <Card title="Restez informé·e" actions={<Badge>Newsletter</Badge>}>
          <form className="flex flex-col gap-4">
            <Input label="Email" type="email" placeholder="vous@example.com" helpText="Promis, zéro spam." />
            <div className="flex gap-3">
              <Button type="submit">S’inscrire</Button>
              <Button variant="ghost" type="button">
                Découvrir nos actions
              </Button>
            </div>
          </form>
        </Card>
        <Card title="Design system rapide" actions={<Badge tone="neutral">Demo</Badge>}>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Primaire</Button>
            <Button variant="secondary">Secondaire</Button>
            <Button variant="ghost">Ghost</Button>
            <Button loading>Chargement</Button>
            <Input label="Champ accessible" placeholder="Votre nom" />
            <Input label="Champ en erreur" placeholder="..." error="Requis" />
            <Badge>Badge</Badge>
            <Badge tone="neutral">Neutre</Badge>
          </div>
        </Card>
      </section>
    </div>
  );
}
