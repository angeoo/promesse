import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { isAdminAuthConfigured, getServerAuthSession } from "@/lib/auth";
import { isPasswordResetEmailConfigured } from "@/lib/email";

export default async function AdminPage() {
  const session = await getServerAuthSession();

  if (session?.user) {
    redirect("/admin/media");
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <header className="rounded-lg border border-border bg-surface px-6 py-5">
          <h1 className="font-heading text-3xl text-foreground">Admin</h1>
          <p className="mt-2 text-sm text-foreground/70">
            Connectez-vous pour accéder à la gestion des médias.
          </p>
        </header>

        {!isAdminAuthConfigured() ? (
          <Card title="Configuration requise">
            Ajoutez `ADMIN_EMAIL`, `ADMIN_PASSWORD` et `NEXTAUTH_SECRET` aux variables d’environnement
            avant d’activer l’espace admin.
          </Card>
        ) : (
          <AdminLoginForm passwordResetEnabled={isPasswordResetEmailConfigured()} />
        )}
      </div>
    </div>
  );
}
