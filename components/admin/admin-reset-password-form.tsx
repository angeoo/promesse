"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ResetPasswordState = {
  loading: boolean;
  error: string | null;
  success: string | null;
};

export function AdminResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [state, setState] = useState<ResetPasswordState>({
    loading: false,
    error: null,
    success: null
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState({ loading: true, error: null, success: null });

    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: String(formData.get("newPassword") || ""),
          confirmPassword: String(formData.get("confirmPassword") || "")
        })
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Impossible de réinitialiser le mot de passe.");
      }

      setState({
        loading: false,
        error: null,
        success: "Mot de passe mis à jour. Vous pouvez vous reconnecter."
      });
      event.currentTarget.reset();
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setState({
        loading: false,
        error:
          error instanceof Error ? error.message : "Erreur lors de la réinitialisation du mot de passe.",
        success: null
      });
    }
  };

  return (
    <Card title="Nouveau mot de passe">
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Input
          name="newPassword"
          label="Nouveau mot de passe"
          type="password"
          autoComplete="new-password"
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
          <Button type="submit" loading={state.loading}>
            Enregistrer
          </Button>
        </div>
        {state.error ? <p className="text-sm text-primary">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-secondary">{state.success}</p> : null}
      </form>
    </Card>
  );
}
