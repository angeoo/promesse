"use client";

import { FormEvent, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Panel = "password" | "email" | null;

type SubmitState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

const initialSubmitState: SubmitState = {
  loading: false,
  error: null,
  success: null
};

export function AdminAccountSettings({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [passwordState, setPasswordState] = useState<SubmitState>(initialSubmitState);
  const [emailState, setEmailState] = useState<SubmitState>(initialSubmitState);

  const togglePanel = (panel: Exclude<Panel, null>) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const submitPasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordState({ loading: true, error: null, success: null });

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: String(formData.get("currentPassword") || ""),
          newPassword: String(formData.get("newPassword") || ""),
          confirmPassword: String(formData.get("confirmPassword") || "")
        })
      });
      const data = (await response.json()) as { error?: string };

      if (response.status === 401) {
        router.replace("/admin");
        throw new Error("Session expirée. Reconnectez-vous.");
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de changer le mot de passe.");
      }

      form.reset();
      setPasswordState({
        loading: false,
        error: null,
        success: "Mot de passe mis à jour. Déconnexion en cours…"
      });
      setActivePanel(null);
      // Invalidate the session immediately so the new sessionBoundAt takes effect.
      setTimeout(() => signOut({ callbackUrl: "/admin" }), 1500);
    } catch (error) {
      setPasswordState({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur lors du changement de mot de passe.",
        success: null
      });
    }
  };

  const submitEmailChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailState({ loading: true, error: null, success: null });

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const response = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: String(formData.get("currentPassword") || ""),
          newEmail: String(formData.get("newEmail") || ""),
          confirmEmail: String(formData.get("confirmEmail") || "")
        })
      });
      const data = (await response.json()) as { error?: string };

      if (response.status === 401) {
        router.replace("/admin");
        throw new Error("Session expirée. Reconnectez-vous.");
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de changer l’email.");
      }

      setEmailState({
        loading: false,
        error: null,
        success: "Email mis à jour. Reconnectez-vous avec la nouvelle adresse."
      });
      await signOut({ callbackUrl: "/admin" });
    } catch (error) {
      setEmailState({
        loading: false,
        error: error instanceof Error ? error.message : "Erreur lors du changement d’email.",
        success: null
      });
    }
  };

  return (
    <Card title="Compte admin" className="h-fit">
      <div className="flex flex-col gap-4">
        <div className="rounded-md border border-border bg-surface px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">Email actuel</p>
          <p className="mt-1 font-semibold text-foreground">{currentEmail}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant={activePanel === "password" ? "secondary" : "ghost"}
            onClick={() => togglePanel("password")}
          >
            Changer le mot de passe
          </Button>
          <Button
            type="button"
            variant={activePanel === "email" ? "secondary" : "ghost"}
            onClick={() => togglePanel("email")}
          >
            Changer l’email
          </Button>
        </div>

        {activePanel === "password" ? (
          <form className="flex flex-col gap-4" onSubmit={submitPasswordChange}>
            <Input
              name="currentPassword"
              label="Mot de passe actuel"
              type="password"
              autoComplete="current-password"
              required
            />
            <Input
              name="newPassword"
              label="Nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              helpText="Entre 12 et 128 caractères."
              minLength={12}
              maxLength={128}
              required
            />
            <Input
              name="confirmPassword"
              label="Confirmer le nouveau mot de passe"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={passwordState.loading}>
                Enregistrer le mot de passe
              </Button>
            </div>
          </form>
        ) : null}

        {activePanel === "email" ? (
          <form className="flex flex-col gap-4" onSubmit={submitEmailChange}>
            <Input
              name="currentPassword"
              label="Mot de passe actuel"
              type="password"
              autoComplete="current-password"
              required
            />
            <Input
              name="newEmail"
              label="Nouvel email"
              type="email"
              autoComplete="email"
              required
            />
            <Input
              name="confirmEmail"
              label="Confirmer le nouvel email"
              type="email"
              autoComplete="email"
              required
            />
            <p className="text-xs text-foreground/60">
              Après validation, la session sera fermée pour vous reconnecter avec la nouvelle adresse.
            </p>
            <div className="flex items-center gap-3">
              <Button type="submit" loading={emailState.loading}>
                Enregistrer l’email
              </Button>
            </div>
          </form>
        ) : null}

        {passwordState.error ? <p className="text-sm text-primary">{passwordState.error}</p> : null}
        {passwordState.success ? <p className="text-sm text-secondary">{passwordState.success}</p> : null}
        {emailState.error ? <p className="text-sm text-primary">{emailState.error}</p> : null}
        {emailState.success ? <p className="text-sm text-secondary">{emailState.success}</p> : null}
      </div>
    </Card>
  );
}
