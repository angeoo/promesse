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
  progress: number; // 0–100, only meaningful when loading=true
};

const ADMIN_FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = ADMIN_FETCH_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Le serveur met trop de temps à répondre.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readResponsePayload(
  response: Response
): Promise<{ error?: string; [key: string]: unknown }> {
  // Use optional chaining: test mocks may not include a headers object.
  const contentType = response.headers?.get("content-type") ?? "";

  // If the server returns JSON (or we have no content-type to go on), try JSON first.
  if (contentType.includes("application/json") || !contentType) {
    try {
      return (await response.json()) as { error?: string; [key: string]: unknown };
    } catch {
      // fall through to text handling
    }
  }

  if (response.status === 413) {
    return { error: "Le fichier est trop volumineux pour le serveur distant." };
  }

  const text = (await response.text?.())?.trim() ?? "";
  if (!text) {
    return { error: `Réponse serveur invalide (HTTP ${response.status}).` };
  }
  if (text.startsWith("<")) {
    return {
      error:
        response.status >= 500
          ? "Le serveur distant a renvoyé une erreur pendant l'upload."
          : `Réponse serveur invalide (HTTP ${response.status}).`
    };
  }
  return { error: text };
}

// Upload a file directly to S3 using a presigned PUT URL.
// Returns a promise that resolves on success and rejects with a human-readable error.
function uploadFileToS3(
  uploadUrl: string,
  file: File,
  contentType: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(
          new Error(
            xhr.status === 403
              ? "Accès S3 refusé. Vérifiez la configuration CORS du bucket."
              : `Erreur lors de l'envoi vers le stockage (${xhr.status}).`
          )
        );
      }
    };

    xhr.onerror = (err) => reject(new Error(`Erreur réseau lors de l'envoi vers le stockage: ${err}`));
    xhr.onabort = () => reject(new DOMException("Upload annulé.", "AbortError"));
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("Cache-Control", "public, max-age=3600");
    xhr.send(file);
  });
}

type SlotStatus = {
  id: string;
  name: string;
  page: string;
  description: string;
  recommendedAspect: MediaAspectRatio;
  acceptedKinds: Array<"image" | "video" | "document">;
  available: boolean;
  currentMedia: MediaAssetDTO | null;
};

function buildAcceptAttr(kinds: Array<"image" | "video" | "document">): string {
  const parts: string[] = [];
  if (kinds.includes("image")) parts.push("image/*");
  if (kinds.includes("video")) parts.push("video/*");
  if (kinds.includes("document")) parts.push("application/pdf");
  return parts.join(",");
}

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
    success: null,
    progress: 0
  });

  const loadMedia = useCallback(async () => {
    setLoadingList(true);
    try {
      const response = await fetchWithTimeout("/api/admin/media", { cache: "no-store" });
      const data = (await readResponsePayload(response)) as {
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
    setUploadState({ loading: true, error: null, success: null, progress: 0 });

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const file = formData.get("file");

      if (!(file instanceof File) || file.size === 0) {
        throw new Error("Sélectionnez un fichier valide.");
      }
      if (!selectedSlotId) {
        throw new Error("Sélectionnez un emplacement.");
      }

      const published = true;

      // Step 1 — ask the server to validate the upload and return a presigned S3 PUT URL.
      const presignResp = await fetchWithTimeout("/api/admin/media/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlotId,
          slotAspect: selectedAspect,
          contentType: file.type,
          filename: file.name,
          size: file.size,
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? ""),
          published
        })
      });

      const presignData = (await readResponsePayload(presignResp)) as {
        uploadUrl?: string;
        storageKey?: string;
        resolvedContentType?: string;
        error?: string;
      };

      if (presignResp.status === 401) {
        router.replace("/admin");
        throw new Error("Session expirée. Reconnectez-vous.");
      }
      if (!presignResp.ok || !presignData.uploadUrl || !presignData.storageKey) {
        throw new Error(presignData.error ?? "Impossible de préparer l'envoi.");
      }

      setUploadState((prev) => ({ ...prev, progress: 5 }));

      // Step 2 — upload the file directly from the browser to S3 (no server proxy).
      const resolvedContentType = presignData.resolvedContentType ?? file.type;
      await uploadFileToS3(presignData.uploadUrl, file, resolvedContentType, (pct) => {
        setUploadState((prev) => ({ ...prev, progress: 5 + Math.round(pct * 0.9) }));
      });

      setUploadState((prev) => ({ ...prev, progress: 96 }));

      // Step 3 — tell the server to register the uploaded file in the database.
      const confirmResp = await fetchWithTimeout("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlotId,
          slotAspect: selectedAspect,
          storageKey: presignData.storageKey,
          contentType: resolvedContentType,
          filename: file.name,
          size: file.size,
          title: String(formData.get("title") ?? ""),
          description: String(formData.get("description") ?? ""),
          published
        })
      });

      const confirmData = (await readResponsePayload(confirmResp)) as { error?: string };

      if (confirmResp.status === 401) {
        router.replace("/admin");
        throw new Error("Session expirée. Reconnectez-vous.");
      }
      if (!confirmResp.ok) {
        throw new Error(confirmData.error ?? "Enregistrement impossible.");
      }

      form.reset();
      await loadMedia();
      setUploadState({ loading: false, error: null, success: "Média uploadé avec succès.", progress: 100 });
    } catch (error) {
      setUploadState({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur durant l'upload.",
        success: null,
        progress: 0
      });
    }
  };

  const onDelete = async (id: string) => {
    setUploadState({ loading: true, error: null, success: null, progress: 0 });
    try {
      const response = await fetchWithTimeout(`/api/admin/media?id=${id}`, { method: "DELETE" });
      const data = (await readResponsePayload(response)) as { error?: string };

      if (response.status === 401) {
        router.replace("/admin");
        throw new Error("Session expirée. Reconnectez-vous.");
      }
      if (!response.ok) {
        throw new Error(data.error ?? "Suppression impossible.");
      }

      await loadMedia();
      setUploadState({ loading: false, error: null, success: "Média supprimé.", progress: 0 });
    } catch (error) {
      setUploadState({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur de suppression.",
        success: null,
        progress: 0
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
          <Card title="Upload d'un média" className="h-fit">
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
                    {selectedSlot.description} | Ratio recommandé: {selectedSlot.recommendedAspect} | Types:{" "}
                    {selectedSlot.acceptedKinds.join(" / ")}
                  </p>
                ) : null}
              </div>

              {selectedSlot && !selectedSlot.acceptedKinds.includes("document") ? (
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
              ) : null}

              <Input name="title" label="Titre" placeholder="Ex. Atelier à Libreville" />
              <Input
                name="description"
                label="Description (optionnel)"
                placeholder="Contexte, lieu, date..."
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground" htmlFor="file">
                  Fichier
                </label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept={selectedSlot ? buildAcceptAttr(selectedSlot.acceptedKinds) : "image/*,video/*,application/pdf"}
                  required
                  className="rounded-md border border-border bg-white px-3 py-2"
                />
                <p className="text-xs text-foreground/60">Taille max: 50 Mo. Formats: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV, PDF.</p>
              </div>

              {uploadState.loading && uploadState.progress > 0 ? (
                <div className="flex flex-col gap-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full bg-secondary transition-all duration-300"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-foreground/60">
                    {uploadState.progress < 96
                      ? `Envoi vers le stockage… ${uploadState.progress}%`
                      : "Finalisation…"}
                  </p>
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={uploadState.loading || slots.length === 0 || !selectedSlotId}
                >
                  {uploadState.loading ? "Envoi…" : "Uploader"}
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
                      {slot.available ? "Disponible" : "Occupé"} | Ratio {slot.recommendedAspect}
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
                    ) : item.kind === "document" ? (
                      <div className="flex items-center gap-3 px-4 py-3">
                        <span className="text-2xl" aria-hidden>📄</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{item.filename}</p>
                          <p className="text-xs text-foreground/60">PDF · {Math.round(item.size / 1024)} Ko</p>
                        </div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-semibold text-secondary hover:underline"
                        >
                          Ouvrir
                        </a>
                      </div>
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
