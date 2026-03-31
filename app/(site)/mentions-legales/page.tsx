export default function MentionsLegalesPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="font-heading text-3xl text-foreground">Mentions légales</h1>
      <p className="mt-4 text-foreground/80">
        Le présent site a pour objet de présenter l&apos;association Promesse, ses actions, ses programmes,
        ses ressources éducatives et ses modalités de contact et de don.
      </p>
      <div className="mt-8 space-y-6 text-foreground/80">
        <section>
          <h2 className="font-heading text-xl text-foreground">Éditeur du site</h2>
          <p className="mt-2">
            Association Promesse
            <br />
            Objet : association humanitaire engagée dans l&apos;éducation menstruelle, la lutte contre la
            précarité et le soutien aux orphelins.
            <br />
            Création : septembre 2022
            <br />
            Email : promesse.association@gmail.com
            <br />
            Adresse postale : à compléter
            <br />
            SIREN / RNA / RCS : à compléter
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground">Responsable de la publication</h2>
          <p className="mt-2">
            Lauriane Babingui
            <br />
            Qualité exacte du responsable de la publication : à compléter
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground">Contact</h2>
          <p className="mt-2">
            Email : promesse.association@gmail.com
            <br />
            Site : lien public configuré via le domaine de déploiement
            <br />
            Page de contact : /contact
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground">Hébergement</h2>
          <p className="mt-2">
            Hébergeur du site web : à compléter
            <br />
            Adresse :
            <br />
            Téléphone :
            <br />
            Le site utilise par ailleurs un stockage de médias de type bucket S3 pour certaines ressources
            publiées.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground">Propriété intellectuelle</h2>
          <p className="mt-2">
            Les contenus publiés sur le site Promesse, notamment les textes, visuels, vidéos, éléments
            graphiques et ressources pédagogiques, sont protégés par les règles applicables en matière de
            propriété intellectuelle, sauf mention contraire. Toute reproduction, représentation,
            adaptation ou exploitation, totale ou partielle, sans autorisation préalable, est interdite.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground">Données personnelles</h2>
          <p className="mt-2">
            Le site permet notamment une prise de contact par email et peut traiter les données transmises
            volontairement par les utilisateurs dans ce cadre. Une politique de confidentialité dédiée est
            recommandée pour détailler les finalités, les bases légales, les durées de conservation et les
            droits des personnes.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-xl text-foreground">Cookies et traceurs</h2>
          <p className="mt-2">
            Le site peut recourir à des mécanismes techniques nécessaires à son fonctionnement, notamment
            pour la diffusion et la mise en cache de contenus statiques comme les images. Si des cookies ou
            autres traceurs non strictement nécessaires sont ajoutés ultérieurement, une information
            spécifique et, le cas échéant, un recueil du consentement devront être mis en place conformément
            aux règles applicables en France.
          </p>
        </section>
      </div>
    </section>
  );
}
