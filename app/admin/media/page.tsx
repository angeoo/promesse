"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MediaAssetDTO } from "@/lib/media";

type UploadState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

type AuthState = {
  checking: boolean;
  authenticated: boolean;
  error: string | null;
  loading: boolean;
};

export default function AdminMediaPage() {
  const [authState, setAuthState] = useState<AuthState>({
    checking: true,
    authenticated: false,
    error: null,
    loading: false
  });
  const [items, setItems] = useState<MediaAssetDTO[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    loading: false,
    error: null,
    success: null
  });

  const checkSession = async () => {
    try {
      const response = await fetch("/api/admin/auth/session", { cache: "no-store" });
      const data = (await response.json()) as { authenticated?: boolean };
      setAuthState({
        checking: false,
        authenticated: Boolean(data.authenticated),
        error: null,
        loading: false
      });
      return Boolean(data.authenticated);
    } catch {
      setAuthState({
        checking: false,
        authenticated: false,
        error: "Impossible de vérifier la session.",
        loading: false
      });
      return false;
    }
  };

  const loadMedia = async () => {
    setLoadingList(true);
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const data = (await response.json()) as { media?: MediaAssetDTO[]; error?: string };
      if (response.status === 401) {
        setAuthState((prev) => ({ ...prev, authenticated: false }));
        setItems([]);
        return;
      }
      if (!response.ok) throw new Error(data.error ?? "Impossible de charger les médias.");
      setItems(data.media ?? []);
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erreur de chargement."
      }));
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    checkSession().then((isAuthenticated) => {
      if (isAuthenticated) {
        loadMedia();
      }
    });
  }, []);

  const onLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") || "");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Connexion impossible.");
      }
      form.reset();
      setAuthState({
        checking: false,
        authenticated: true,
        error: null,
        loading: false
      });
      await loadMedia();
    } catch (error) {
      setAuthState({
        checking: false,
        authenticated: false,
        error: error instanceof Error ? error.message : "Erreur de connexion.",
        loading: false
      });
    }
  };

  const onLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    setItems([]);
    setAuthState({
      checking: false,
      authenticated: false,
      error: null,
      loading: false
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadState({ loading: true, error: null, success: null });

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as { error?: string };

      if (response.status === 401) {
        setAuthState((prev) => ({ ...prev, authenticated: false }));
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
      const response = await fetch(`/api/admin/media?id=${id}`, {
        method: "DELETE"
      });
      const data = (await response.json()) as { error?: string };

      if (response.status === 401) {
        setAuthState((prev) => ({ ...prev, authenticated: false }));
        throw new Error("Session expirée. Reconnectez-vous.");
      }

      if (!response.ok) throw new Error(data.error ?? "Suppression impossible.");
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

  if (authState.checking) {
    return (
      <div className="min-h-screen bg-white px-4 py-10 md:px-8">
        <div className="mx-auto max-w-xl">
          <Card title="Admin médias">Vérification de session...</Card>
        </div>
      </div>
    );
  }

  if (!authState.authenticated) {
    return (
      <div className="min-h-screen bg-white px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-xl flex-col gap-6">
          <header className="rounded-lg border border-border bg-surface px-6 py-5">
            <h1 className="font-heading text-3xl text-foreground">Admin médias</h1>
            <p className="mt-2 text-sm text-foreground/70">
              Connexion requise pour gérer les contenus image et vidéo.
            </p>
          </header>

          <Card title="Connexion admin">
            <form className="flex flex-col gap-4" onSubmit={onLogin}>
              <Input
                name="password"
                label="Mot de passe"
                type="password"
                autoComplete="current-password"
                required
              />
              <div className="flex items-center gap-3">
                <Button type="submit" loading={authState.loading}>
                  Se connecter
                </Button>
                {authState.error ? <p className="text-sm text-primary">{authState.error}</p> : null}
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

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

        <section className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <Card title="Upload d’un média" className="h-fit">
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
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
                  accept="image/*,video/*"
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
                <Button type="submit" disabled={uploadState.loading}>
                  {uploadState.loading ? "Envoi..." : "Uploader"}
                </Button>
              </div>
              {uploadState.error ? <p className="text-sm text-primary">{uploadState.error}</p> : null}
              {uploadState.success ? <p className="text-sm text-secondary">{uploadState.success}</p> : null}
            </form>
          </Card>

          <section className="flex flex-col gap-4">
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
