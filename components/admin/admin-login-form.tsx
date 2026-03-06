"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type LoginState = {
  loading: boolean;
  error: string | null;
};

type ResetState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

export function AdminLoginForm({ passwordResetEnabled }: { passwordResetEnabled: boolean }) {
  const router = useRouter();
  const [loginState, setLoginState] = useState<LoginState>({
    loading: false,
    error: null
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetState, setResetState] = useState<ResetState>({
    loading: false,
    error: null,
    success: null
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginState({ loading: true, error: null });

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin/media"
    });

    if (!result || result.error) {
      setLoginState({
        loading: false,
        error: "Identifiants invalides."
      });
      return;
    }

    router.replace("/admin/media");
    router.refresh();
  };

  const onForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetState({
      loading: true,
      error: null,
      success: null
    });

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") || "").trim();

      const response = await fetch("/api/admin/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = (await response.json()) as { error?: string; ok?: boolean; message?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible d’envoyer le lien de réinitialisation.");
      }

      setResetState({
        loading: false,
        error: null,
        success:
          data.message ??
          "Si un compte existe pour cet email, un lien de réinitialisation vient d’être envoyé."
      });
    } catch (error) {
      setResetState({
        loading: false,
        error:
          error instanceof Error ? error.message : "Erreur lors de l’envoi du lien de réinitialisation.",
        success: null
      });
    }
  };

  return (
    <Card title="Connexion admin">
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Input
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
        />
        <Input
          name="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
        />
        <div className="flex items-center gap-3">
          <Button type="submit" loading={loginState.loading}>
            Se connecter
          </Button>
          {loginState.error ? <p className="text-sm text-primary">{loginState.error}</p> : null}
        </div>
      </form>
      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowForgotPassword((current) => !current)}
          disabled={!passwordResetEnabled}
        >
          Mot de passe oublié ?
        </Button>
        {!passwordResetEnabled ? (
          <p className="text-sm text-foreground/60">
            Réinitialisation par email indisponible tant que l’envoi d’email n’est pas configuré.
          </p>
        ) : null}
        {showForgotPassword && passwordResetEnabled ? (
          <form className="flex flex-col gap-4" onSubmit={onForgotPassword}>
            <Input
              name="email"
              label="Email admin"
              type="email"
              autoComplete="email"
              required
            />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={resetState.loading}>
                Envoyer le lien
              </Button>
            </div>
            {resetState.error ? <p className="text-sm text-primary">{resetState.error}</p> : null}
            {resetState.success ? <p className="text-sm text-secondary">{resetState.success}</p> : null}
          </form>
        ) : null}
      </div>
    </Card>
  );
}
