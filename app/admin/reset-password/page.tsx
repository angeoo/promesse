import { Card } from "@/components/ui/card";
import { AdminResetPasswordForm } from "@/components/admin/admin-reset-password-form";

export default function AdminResetPasswordPage({
  searchParams
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token?.trim() || "";

  return (
    <div className="min-h-screen bg-white px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <header className="rounded-lg border border-border bg-surface px-6 py-5">
          <h1 className="font-heading text-3xl text-foreground">Réinitialisation admin</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Choisissez un nouveau mot de passe sécurisé.
          </p>
        </header>
        {token ? (
          <AdminResetPasswordForm token={token} />
        ) : (
          <Card title="Lien invalide">Le lien de réinitialisation est incomplet ou invalide.</Card>
        )}
      </div>
    </div>
  );
}
