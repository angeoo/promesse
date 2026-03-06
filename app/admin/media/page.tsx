import { redirect } from "next/navigation";
import { AdminMediaManager } from "@/components/admin/admin-media-manager";
import { getServerAuthSession } from "@/lib/auth";

export default async function AdminMediaPage() {
  const session = await getServerAuthSession();

  if (!session?.user?.email) {
    redirect("/admin");
  }

  return <AdminMediaManager adminEmail={session.user.email} />;
}
