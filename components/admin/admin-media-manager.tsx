"use client";

import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AdminAccountSettings } from "@/components/admin/admin-account-settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MediaAssetDTO } from "@/lib/media";
import type { MediaAspectRatio } from "@/lib/media-slots";

type UploadState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

const ADMIN_FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ADMIN_FETCH_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Le serveur met trop de temps à répondre.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

type SlotStatus = {
  id: string;
  name: string;
  page: string;
  description: string;
  recommendedAspect: MediaAspectRatio;
  acceptedKinds: Array<"image" | "video">;
  available: boolean;
  currentMedia: MediaAssetDTO | null;
};

export function AdminMediaManager({ adminEmail }: { adminEmail: string }) {
  const router = useRouter();
  const [items, setItems] = useState<MediaAssetDTO[]>([]);
  const [slots, setSlots] = useState<SlotStatus[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedAspect, setSelectedAspect] = useState<MediaAspectRatio>("1/1");
  const [uploadState, setUploadState] = useState<UploadState>({
    loading: false,
    error: null,
    success: null
  });

  const loadMedia = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await fetchWithTimeout("/api/admin/media", { cache: "no-store" });
      const data = (await response.json()) as {
        media?: MediaAssetDTO[];
        slots?: SlotStatus[];
        warning?: string;
        error?: string;
      };

      if (response.status === 401) {
        setItems([]);
        setSlots([]);
        router.replace("/admin");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de charger les médias.");
      }

      setItems(data.media ?? []);
      setSlots(data.slots ?? []);

      if (data.warning) {
        setUploadState((prev) => ({
          ...prev,
          error: data.warning ?? "Avertissement de chargement."
        }));
      }

      setSelectedSlotId((prev) => prev || data.slots?.[0]?.id || "");
      setSelectedAspect((prev) => prev || "1/1");
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erreur de chargement."
      }));
    } finally {
      setLoadingList(false);
    }
  }, [router]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    if (slots.length === 0) {
      if (selectedSlotId !== "") setSelectedSlotId("");
      return;
    }

    const slotStillExists = slots.some((slot) => slot.id === selectedSlotId);
    if (!slotStillExists) {
      setSelectedSlotId(slots[0].id);
      setSelectedAspect("1/1");
    }
  }, [slots, selectedSlotId]);

  const onLogout = async () => {
    await signOut({ callbackUrl: "/admin" });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadState({ loading: true, error: null, success: null });

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      if (!selectedSlotId) {
        throw new Error("Sélectionnez un emplacement.");
      }

      formData.set("slotId", selectedSlotId);
      formData.set("slotAspect", selectedAspect);

      const response = await fetchWithTimeout("/api/admin/media", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as { error?: string };

      if (response.status === 401) {
        router.replace("/admin");
        throw new Error("Session expirée. Reconnectez-vous.");
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Upload impossible.");
      }

      form.reset();
      await loadMedia();
      setUploadState({
        loading: false,
        error: null,
        success: "Média uploadé avec succès."
      });
    } catch (error) {
      setUploadState({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur durant l'upload.",
        success: null
      });
    }
  };

  const onDelete = async (id: string) => {
    setUploadState({ loading: true, error: null, success: null });

    try {
      const response = await fetchWithTimeout(`/api/admin/media?id=${id}`, {
        method: "DELETE"
      });
      const data = (await response.json()) as { error?: string };

      if (response.status === 401) {
        router.replace("/admin");
        throw new Error("Session expirée. Reconnectez-vous.");
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Suppression impossible.");
      }

      await loadMedia();
      setUploadState({
        loading: false,
        error: null,
        success: "Média supprimé."
      });
    } catch (error) {
      setUploadState({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur de suppression.",
        success: null
      });
    }
  };

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? null;

  return (
    <div className="min-h-screen bg-white px-4 py-8 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-xl border border-border bg-surface px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-3xl text-foreground">Admin médias</h1>
            <p className="text-sm text-foreground/70">
              Upload, publication et suppression des médias du site.
            </p>
          </div>
          <Button variant="ghost" onClick={onLogout}>
            Déconnexion
          </Button>
        </header>

        <AdminAccountSettings currentEmail={adminEmail} />

        <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <Card title="Upload d’un média" className="h-fit">
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="slotId">
                  Emplacement front
                </label>
                <select
                  id="slotId"
                  name="slotId"
                  value={selectedSlotId}
                  onChange={(event) => setSelectedSlotId(event.target.value)}
                  required={slots.length > 0}
                  disabled={slots.length === 0}
                  className="rounded-md border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Sélectionnez un emplacement...
                  </option>
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.name}
                    </option>
                  ))}
                </select>
                {slots.length === 0 ? (
                  <p className="text-xs text-primary">
                    Aucun emplacement chargé. Rafraîchissez la page ou reconnectez-vous.
                  </p>
                ) : null}
                {selectedSlot ? (
                  <p className="text-xs text-foreground/60">
                    {selectedSlot.description} | Ratio recommande: {selectedSlot.recommendedAspect} | Types:{" "}
                    {selectedSlot.acceptedKinds.join(" / ")}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="slotAspect">
                  Ratio choisi
                </label>
                <select
                  id="slotAspect"
                  name="slotAspect"
                  value={selectedAspect}
                  onChange={(event) => setSelectedAspect(event.target.value as MediaAspectRatio)}
                  className="rounded-md border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="16/9">16/9</option>
                  <option value="4/3">4/3</option>
                  <option value="1/1">1/1</option>
                </select>
              </div>
              <Input name="title" label="Titre" placeholder="Ex. Atelier à Libreville" />
              <Input
                name="description"
                label="Description (optionnel)"
                placeholder="Contexte, lieu, date..."
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="file">
                  Fichier image ou vidéo
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept={
                    selectedSlot
                      ? selectedSlot.acceptedKinds.length === 2
                        ? "image/*,video/*"
                        : selectedSlot.acceptedKinds[0] === "video"
                          ? "video/*"
                          : "image/*"
                      : "image/*,video/*"
                  }
                  required
                  className="rounded-md border border-border bg-white px-3 py-2"
                />
                <p className="text-xs text-foreground/60">Taille max: 50 Mo.</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-foreground/80">
                <input type="checkbox" name="published" value="true" defaultChecked />
                Publier immédiatement
              </label>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={uploadState.loading || slots.length === 0 || !selectedSlotId}>
                  {uploadState.loading ? "Envoi..." : "Uploader"}
                </Button>
              </div>
              {uploadState.error ? <p className="text-sm text-primary">{uploadState.error}</p> : null}
              {uploadState.success ? <p className="text-sm text-secondary">{uploadState.success}</p> : null}
            </form>
          </Card>

          <section className="flex flex-col gap-4">
            <Card title="Places disponibles">
              <div className="mb-3 flex items-center justify-between text-xs text-foreground/60">
                <span>Total emplacements: {slots.length}</span>
                <span>Disponibles: {slots.filter((slot) => slot.available).length}</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlotId(slot.id);
                      setSelectedAspect(slot.recommendedAspect);
                    }}
                    className={[
                      "rounded-md border px-3 py-2 text-xs text-left transition",
                      selectedSlotId === slot.id ? "ring-2 ring-secondary/60" : "",
                      slot.available
                        ? "border-border/70 bg-foreground/5 text-foreground/55"
                        : "border-border bg-surface text-foreground"
                    ].join(" ")}
                    aria-pressed={selectedSlotId === slot.id}
                  >
                    <p className={slot.available ? "font-semibold text-foreground/55" : "font-semibold text-foreground"}>
                      {slot.name}
                    </p>
                    <p className={slot.available ? "text-foreground/50" : "text-foreground/70"}>{slot.page}</p>
                    <p className={slot.available ? "text-foreground/45" : "text-foreground/60"}>
                      {slot.available ? "Disponible" : "Occupe"} | Ratio {slot.recommendedAspect}
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl text-foreground">Médias existants</h2>
              <Button variant="ghost" onClick={loadMedia} disabled={loadingList}>
                Rafraîchir
              </Button>
            </div>
            {loadingList ? <p className="text-foreground/70">Chargement...</p> : null}
            {!loadingList && items.length === 0 ? (
              <p className="text-foreground/70">Aucun média pour le moment.</p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <Card key={item.id} title={item.title}>
                  <p className="mb-2 text-xs text-foreground/60">
                    Slot: {item.slotName} ({item.slotId}) | Ratio: {item.slotAspect}
                  </p>
                  <div className="mb-3 overflow-hidden rounded-md border border-border bg-surface">
                    {item.kind === "video" ? (
                      <video src={item.url} controls className="h-auto w-full" />
                    ) : (
                      <img src={item.url} alt={item.title} className="h-auto w-full object-cover" />
                    )}
                  </div>
                  {item.description ? (
                    <p className="mb-3 text-sm text-foreground/70">{item.description}</p>
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-foreground/60">
                      {new Date(item.createdAt).toLocaleString("fr-FR")}
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => onDelete(item.id)}
                      disabled={uploadState.loading}
                    >
                      Supprimer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
