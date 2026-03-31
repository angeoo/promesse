import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text, Title } from "@/components/ui/typography";
import { MediaPlaceholder, getAspectPaddingClass } from "@/components/ui/media-placeholder";
import { ResettableVideo } from "@/components/ui/resettable-video";
import { listPublishedMediaBySlotIds } from "@/lib/media";

const options = [
  {
    title: "Devenir bénévole",
    detail: "Rejoindre les équipes terrain, logistique ou coordination des projets.",
    cta: "Je m’engage",
    href: "mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Candidature%20b%C3%A9n%C3%A9vole",
    buttonClassName: "bg-primary text-white hover:bg-primary/90"
  },
  {
    title: "Devenir Ambassadeur Promesse",
    detail: "Représenter l’association lors de missions humanitaires et événements clés.",
    cta: "Candidater",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSfpV11Zy7iAWm4YgJvodHRykNP06vq2MlHToMOi7jet8x2NHw/viewform?fbclid=PARlRTSAQVLvpleHRuA2FlbQIxMABzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAaeSJQ6Y6AYi2mr6vjOrUNqZV8IpjdOVWGC4HqvuCE_fi2sdaT2IBfieBk4IhA_aem_-1sTrhv0DRkcL3nmRuWyag",
    newTab: true,
    buttonClassName: "bg-secondary text-white hover:bg-secondary/90"
  },
  {
    title: "Faire un don",
    detail: "Financer les actions, soutenir les programmes et accompagner les bénéficiaires.",
    cta: "Donner maintenant",
    href: "https://www.helloasso.com/associations/promesse?fbclid=PARlRTSAQVLtRleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAadWybV6a4hMQg5wjU9h1t0eY-kEdXb0q2y3inhuCJVMsNzzLwnehcgahRquzA_aem_O8HSHfkS6E4u2f3Jhu0X9Q",
    newTab: true,
    buttonClassName: "bg-accent text-white hover:bg-accent/90"
  }
];

export default async function SEngagerPage() {
  const mediaBySlot = await listPublishedMediaBySlotIds(["s-engager.call_video"]);
  const callVideoSrc =
    mediaBySlot["s-engager.call_video"]?.kind === "video"
      ? mediaBySlot["s-engager.call_video"].url
      : undefined;
  const callVideoAspect = mediaBySlot["s-engager.call_video"]?.slotAspect ?? "16/9";
  const callVideoContentType = mediaBySlot["s-engager.call_video"]?.contentType;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Title level={2}>Promesse, c’est toi. C’est moi. C’est nous.</Title>
        <Text tone="muted">
          Engage-toi selon ton temps, tes compétences ou tes moyens. Chaque geste compte pour celles et
          ceux que nous accompagnons.
        </Text>
      </header>

      <section className="card-grid items-stretch">
        {options.map((opt) => (
          <Card key={opt.title} title={opt.title} className="h-full">
            <div className="flex h-full flex-col gap-4">
              <Text tone="muted">{opt.detail}</Text>
              <div className="mt-auto pt-2">
                <Button href={opt.href} newTab={opt.newTab} className={opt.buttonClassName}>
                  {opt.cta}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <Card title="Vidéo d’appel à l’engagement">
        <Text tone="muted">
          Une vidéo majeure pour montrer les visages, les actions et le pourquoi. Objectif : donner
          envie de s’impliquer et de passer à l’action.
        </Text>
        <div className="pt-3">
          {callVideoSrc ? (
            <div
              className={`relative w-full overflow-hidden rounded-lg border border-border shadow-soft ${getAspectPaddingClass(callVideoAspect)}`}
            >
              <ResettableVideo
                src={callVideoSrc}
                contentType={callVideoContentType}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          ) : (
            <MediaPlaceholder label="Vidéo engagement" tone="video" aspect={callVideoAspect} />
          )}
        </div>
      </Card>
    </div>
  );
}
