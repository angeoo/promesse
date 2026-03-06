import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder, getAspectPaddingClass } from "@/components/ui/media-placeholder";
import { ResettableVideo } from "@/components/ui/resettable-video";
import { listPublishedMediaBySlotIds } from "@/lib/media";

const stats = [
  { label: "Protections distribuées", value: "400+" },
  { label: "Interventions", value: "10+" },
  { label: "Zones d’action", value: "France & Afrique" }
];

export default async function HomePage() {
  const mediaBySlot = await listPublishedMediaBySlotIds(
    [
      "home.hero_visual",
      "home.gallery_video_main",
      "home.gallery_photo_workshop",
      "home.gallery_infographic"
    ]
  );

  const heroSrc =
    mediaBySlot["home.hero_visual"]?.kind === "image"
      ? mediaBySlot["home.hero_visual"].url
      : "/accueil/image-1.png";
  const heroAspect = "1/1";
  const mainVideoSrc =
    mediaBySlot["home.gallery_video_main"]?.kind === "video"
      ? mediaBySlot["home.gallery_video_main"].url
      : "/accueil/f30c6134-8c9c-4403-af3b-8aa67e61c357.mp4";
  const mainVideoAspect = "1/1";
  const workshopPhotoSrc =
    mediaBySlot["home.gallery_photo_workshop"]?.kind === "image"
      ? mediaBySlot["home.gallery_photo_workshop"].url
      : "/accueil/image-2.jpeg";
  const workshopPhotoAspect = "1/1";
  const infographicSrc =
    mediaBySlot["home.gallery_infographic"]?.kind === "image"
      ? mediaBySlot["home.gallery_infographic"].url
      : undefined;
  const infographicAspect = "1/1";

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
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              href="mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Candidature%20b%C3%A9n%C3%A9vole"
            >
              Devenir bénévole
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              href="https://www.helloasso.com/associations/promesse?fbclid=PARlRTSAQVLtRleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAadWybV6a4hMQg5wjU9h1t0eY-kEdXb0q2y3inhuCJVMsNzzLwnehcgahRquzA_aem_O8HSHfkS6E4u2f3Jhu0X9Q"
              newTab
            >
              Faire un don
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="p-4 text-center min-h-[140px] sm:min-h-[160px] flex items-center justify-center"
              >
                <p className="text-xl sm:text-2xl font-heading font-semibold text-foreground leading-tight">
                  {stat.value}
                </p>
                <p className="text-sm sm:text-base text-foreground/70 leading-snug">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-6 rounded-3xl bg-primary/10 blur-2xl" aria-hidden />
          <Card className="relative overflow-hidden p-0 h-full">
            <MediaPlaceholder
              src={heroSrc}
              fallbackSrc="/accueil/image-1.png"
              alt="L'equipe de l'association Promesse"
              aspect={heroAspect}
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
          <div
            className={`relative w-full overflow-hidden rounded-lg border border-border shadow-soft ${getAspectPaddingClass(mainVideoAspect)}`}
          >
            <ResettableVideo
              src={mainVideoSrc}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <MediaPlaceholder
            src={workshopPhotoSrc}
            fallbackSrc="/accueil/image-2.jpeg"
            label="Atelier santé menstruelle" tone="photo" aspect={workshopPhotoAspect} />
          <MediaPlaceholder src={infographicSrc} label="Infographie impact" tone="chart" aspect={infographicAspect} />
        </div>
      </section>

      <section className="flex justify-center">
        <Card className="w-full max-w-2xl text-center">
          <div className="flex flex-col items-center gap-3">
            <Badge>Newsletter</Badge>
            <Title level={3}>Restez informé·e</Title>
            <Text tone="muted">Laissez votre email et nous vous répondrons rapidement.</Text>
          </div>
          <form
            className="mx-auto mt-2 flex w-full max-w-md flex-col items-center gap-4"
            action="mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Inscription%20newsletter"
            method="post"
            encType="text/plain"
          >
            <label className="flex w-full flex-col gap-2 text-center text-sm font-medium text-foreground">
              <span className="font-semibold text-foreground">Email</span>
              <input
                name="Email"
                type="email"
                required
                placeholder="vous@example.com"
                className="rounded-md border border-border bg-white px-4 py-2 text-base text-foreground shadow-sm outline-none transition focus:border-secondary focus:shadow-focus"
              />
              <span className="text-xs text-accent">Promis, zéro spam.</span>
            </label>
            <div className="flex flex-wrap justify-center gap-3 w-full">
              <Button type="submit">S’inscrire</Button>
              <a
                href="/actions"
                className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2.5 text-base font-semibold text-foreground transition-colors duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              >
                Découvrir nos actions
              </a>
            </div>
          </form>
        </Card>
      </section>
    </div>
  );
}
