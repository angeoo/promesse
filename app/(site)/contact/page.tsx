import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Title level={2}>Une question, une envie d’agir ?</Title>
        <Text tone="muted">
          Écrivez-nous, proposez un partenariat ou effectuez un don pour soutenir les programmes de
          Promesse.
        </Text>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card title="Contact direct" actions={<Badge tone="secondary">Email</Badge>}>
          <Text tone="muted">promesse.association@gmail.com</Text>
          <Text tone="muted">Linktree : https://linktr.ee/asso.promesse</Text>
          <div className="pt-3 flex flex-wrap gap-2">
            <Badge>Solidarité</Badge>
            <Badge tone="neutral">Parrainage</Badge>
            <Badge tone="secondary">Éducation</Badge>
          </div>
        </Card>
        <Card title="Formulaire rapide">
          <form className="flex flex-col gap-3">
            <Input label="Nom" placeholder="Votre nom" />
            <Input label="Email" type="email" placeholder="vous@example.com" />
            <Input label="Sujet" placeholder="Partenariat, don, bénévolat..." />
            <Button type="submit">Envoyer</Button>
          </form>
        </Card>
      </section>

      <Card title="Faire un don" actions={<Badge tone="secondary">Prioritaire</Badge>}>
        <Text tone="muted">
          Vos dons financent les actions, soutiennent les programmes et accompagnent durablement les
          bénéficiaires. Merci pour votre générosité.
        </Text>
        <div className="flex flex-wrap gap-3 pt-3">
          <Button>Don en ligne</Button>
          <Button variant="ghost">Voir l’utilisation des dons</Button>
        </div>
      </Card>

      <Card title="Images des actions financées">
        <MediaPlaceholder label="Photos terrain financées par les dons" tone="photo" aspect="4/3" />
      </Card>
    </div>
  );
}
