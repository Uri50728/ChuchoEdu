import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, created_at")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-12">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">Mi cuenta</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">Información personal</h1>

          <dl className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Nombre</dt>
              <dd className="text-base">{profile?.full_name || "Sin definir"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Correo</dt>
              <dd className="text-base">{user.email}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Rol</dt>
              <dd className="text-base capitalize">{profile?.role || "student"}</dd>
            </div>
            {profile?.created_at ? (
              <div className="flex flex-col gap-1">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Miembro desde</dt>
                <dd className="text-base">{new Date(profile.created_at).toLocaleDateString("es-ES")}</dd>
              </div>
            ) : null}
          </dl>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
