import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";

const programs = [
  {
    name: "Éducation menstruelle",
    status: "En cours",
    detail: "Ateliers santé dans 3 lycées, kits pédagogiques livrés."
  },
  {
    name: "Programme Ambassadeurs",
    status: "Recrutement",
    detail: "Sélection de 12 ambassadeurs pour missions Afrique."
  },
  {
    name: "Soutien orphelins",
    status: "Structuration",
    detail: "Partenariats en cours avec 2 orphelinats."
  }
];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14 flex flex-col gap-10">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Title level={2}>Tableau de bord</Title>
          <Text tone="muted">Vision rapide des actions et ressources.</Text>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="secondary">Version demo</Badge>
          <Button variant="ghost">Exporter</Button>
          <Button>Nouvelle action</Button>
        </div>
      </header>

      <section className="card-grid">
        {programs.map((program) => (
          <Card
            key={program.name}
            title={program.name}
            actions={<Badge tone="neutral">{program.status}</Badge>}
          >
            {program.detail}
          </Card>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card title="Bénévoles actifs" className="items-center text-center">
          <p className="font-heading text-3xl">28</p>
          <Text tone="muted">Suivi des disponibilités et affectations.</Text>
        </Card>
        <Card title="Dons reçus" className="items-center text-center">
          <p className="font-heading text-3xl">12K €</p>
          <Text tone="muted">Données simulées pour la démo.</Text>
        </Card>
        <Card title="Prochaines missions" className="items-center text-center">
          <p className="font-heading text-3xl">4</p>
          <Text tone="muted">Afrique centrale, Île-de-France, Lyon, Marseille.</Text>
        </Card>
      </section>
    </main>
  );
}
