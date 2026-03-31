import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text, Title } from "@/components/ui/typography";
import { getAspectPaddingClass } from "@/components/ui/media-placeholder";
import { listPublishedMediaBySlotIds } from "@/lib/media";
import { getSiteUrl } from "@/lib/site-url";

const contactAlbumSlots = [
  { slotId: "contact.album.01", fallbackSrc: "/dons/terrain/image00001.jpeg" },
  { slotId: "contact.album.02", fallbackSrc: "/dons/terrain/image00002.jpeg" },
  { slotId: "contact.album.03", fallbackSrc: "/dons/terrain/image00003.jpeg" },
  { slotId: "contact.album.04", fallbackSrc: "/dons/terrain/image00004.jpeg" },
  { slotId: "contact.album.05", fallbackSrc: "/dons/terrain/image00005.jpeg" },
  { slotId: "contact.album.06", fallbackSrc: "/dons/terrain/image00006.jpeg" },
  { slotId: "contact.album.07", fallbackSrc: "/dons/terrain/image00007.jpeg" },
  { slotId: "contact.album.08", fallbackSrc: "/dons/terrain/image00008.jpeg" },
  { slotId: "contact.album.09", fallbackSrc: "/dons/terrain/image00009.jpeg" }
] as const;

export default async function ContactPage() {
  const siteUrl = getSiteUrl();
  const mediaBySlot = await listPublishedMediaBySlotIds(
    contactAlbumSlots.map((item) => item.slotId)
  );

  const terrainPhotos = contactAlbumSlots.map((item, index) => ({
    src:
      mediaBySlot[item.slotId]?.kind === "image" ? mediaBySlot[item.slotId].url : item.fallbackSrc,
    alt: `Photo terrain ${index + 1}`,
    aspect: mediaBySlot[item.slotId]?.slotAspect ?? "1/1"
  }));
  const isOddCount = terrainPhotos.length % 2 === 1;

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
        <Card title="Contact direct">
          <Text tone="muted">
            Contacte-nous directement pour une question, un partenariat ou une demande d’information.
          </Text>
          <div className="grid gap-3 pt-2">
            <a
              href="mailto:promesse.association@gmail.com"
              className="group rounded-xl border border-border bg-surface/70 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Email</p>
              <p className="mt-1 text-base font-semibold text-foreground transition group-hover:text-primary">
                promesse.association@gmail.com
              </p>
            </a>
            <a
              href="https://linktr.ee/asso.promesse"
              target="_blank"
              rel="noreferrer noopener"
              className="group rounded-xl border border-border bg-surface/70 px-4 py-3 transition hover:border-secondary/30 hover:bg-secondary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Linktree</p>
              <p className="mt-1 text-base font-semibold text-foreground transition group-hover:text-secondary">
                linktr.ee/asso.promesse
              </p>
            </a>
            <a
              href={siteUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="group rounded-xl border border-border bg-surface/70 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Site web</p>
              <p className="mt-1 text-base font-semibold text-foreground transition group-hover:text-primary">
                {siteUrl.replace(/^https?:\/\//, "")}
              </p>
            </a>
          </div>
          <div className="pt-3 flex flex-wrap gap-2">
            <Badge>Solidarité</Badge>
            <Badge tone="neutral">Parrainage</Badge>
            <Badge tone="secondary">Éducation</Badge>
          </div>
        </Card>
        <Card title="Formulaire rapide">
          <form
            className="flex flex-col gap-3"
            action="mailto:promesse.association@gmail.com?subject=Site%20Promesse%20-%20Prise%20de%20contact"
            method="post"
            encType="text/plain"
          >
            <Input name="Nom" label="Nom" placeholder="Votre nom" required />
            <Input name="Email" label="Email" type="email" placeholder="vous@example.com" required />
            <Input name="Sujet" label="Sujet" placeholder="Partenariat, don, bénévolat..." required />
            <Button type="submit">Envoyer</Button>
          </form>
        </Card>
      </section>

      <Card title="Faire un don">
        <Text tone="muted">
          Vos dons financent les actions, soutiennent les programmes et accompagnent durablement les
          bénéficiaires. Merci pour votre générosité.
        </Text>
        <div className="flex flex-wrap gap-3 pt-3">
          <Button
            href="https://www.helloasso.com/associations/promesse?fbclid=PARlRTSAQVLtRleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAadWybV6a4hMQg5wjU9h1t0eY-kEdXb0q2y3inhuCJVMsNzzLwnehcgahRquzA_aem_O8HSHfkS6E4u2f3Jhu0X9Q"
            newTab
          >
            Don en ligne
          </Button>
          <Button
            variant="secondary"
            href="https://donorbox.org/bourse-solidaire?language=fr"
            newTab
          >
            Don bourse solidaire
          </Button>
          <Button
            variant="ghost"
            href="https://donorbox.org/soutenir-nos-causes?language=fr"
            newTab
          >
            Don via PayPal
          </Button>
        </div>
      </Card>

      <Card title="Images des actions financées" actions={<Badge tone="secondary">Album terrain</Badge>}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {terrainPhotos.map((photo, index) => (
            <figure
              key={photo.alt}
              className={[
                "group relative overflow-hidden rounded-lg border border-border bg-white p-2 shadow-soft transition duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-lg",
                isOddCount && index === terrainPhotos.length - 1
                  ? "col-span-2 w-full max-w-[calc((100%-1rem)/2)] justify-self-center md:col-span-1 md:max-w-none md:justify-self-auto"
                  : "",
                index % 3 === 0 ? "-rotate-2" : "",
                index % 3 === 1 ? "rotate-1" : "",
                index % 3 === 2 ? "-rotate-1" : ""
              ].join(" ")}
            >
              <div className={`relative w-full overflow-hidden rounded-md ${getAspectPaddingClass(photo.aspect)}`}>
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            </figure>
          ))}
        </div>
      </Card>
    </div>
  );
}
