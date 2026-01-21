import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

const missions = [
  "Lutter contre la précarité menstruelle",
  "Promouvoir l’éducation et la santé",
  "Soutenir les orphelins",
  "Sensibiliser et plaider"
];

const valeurs = ["Amour", "Espoir", "Engagement", "Transparence", "Responsabilité", "Solidarité", "Dignité"];

export default function AssociationPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Badge tone="secondary">L’association</Badge>
        <Title level={2}>Promesse : agir pour la dignité et l’éducation</Title>
        <Text tone="muted">
          Fondée en 2022 par Lauriane Babingui, Promesse s’engage auprès des publics vulnérables pour
          briser les tabous sur le cycle menstruel, soutenir les orphelins et défendre des conditions
          de vie dignes.
        </Text>
      </header>

      <section className="card-grid">
        <Card title="Notre histoire">
          Ayant souffert de douleurs menstruelles sans réponses, Lauriane Babingui a décidé d’agir et
          de créer Promesse. Son témoignage est le moteur d’une mobilisation collective.
        </Card>
        <Card title="Notre vision">
          Un monde où le cycle menstruel n’est plus un sujet de honte et où chaque enfant grandit avec
          espoir, éducation et accompagnement.
        </Card>
        <Card title="Gouvernance">
          Conseil d’administration engagé, pôles opérationnels coordonnés, transparence et rigueur
          dans la prise de décision.
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Missions">
          <ul className="list-disc pl-4 text-foreground/80">
            {missions.map((mission) => (
              <li key={mission}>{mission}</li>
            ))}
          </ul>
        </Card>
        <Card title="Valeurs">
          <div className="flex flex-wrap gap-2">
            {valeurs.map((valeur) => (
              <Badge key={valeur} tone="primary">
                {valeur}
              </Badge>
            ))}
          </div>
        </Card>
      </section>

      <Card title="Mot de la Présidente (vidéo)">
        <MediaPlaceholder label="Vidéo à intégrer" tone="video" />
      </Card>
    </div>
  );
}
