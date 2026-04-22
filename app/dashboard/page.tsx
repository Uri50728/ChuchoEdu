import Link from "next/link"
import { redirect } from "next/navigation"
import { BookOpen, PlayCircle } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single()

  const firstName = (profile?.full_name || user.email || "").split(" ")[0] || "Estudiante"

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-12">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">Mi panel</p>
            <h1 className="font-serif text-4xl tracking-tight md:text-5xl">Hola, {firstName}</h1>
            <p className="max-w-xl text-muted-foreground text-pretty">
              Bienvenido a Aula. Desde aquí podrás continuar tus cursos, ver tu progreso y descargar tus certificados.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-serif text-2xl">Explorar cursos</h2>
              <p className="text-sm text-muted-foreground">
                Pronto tendrás disponible la biblioteca completa con cursos de múltiples categorías.
              </p>
              <Button variant="outline" disabled className="w-fit">
                Próximamente
              </Button>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PlayCircle className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-serif text-2xl">Continuar aprendiendo</h2>
              <p className="text-sm text-muted-foreground">
                Aquí verás tus cursos en progreso con la posibilidad de retomar desde donde lo dejaste.
              </p>
              <Button variant="outline" disabled className="w-fit">
                Sin cursos activos
              </Button>
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-dashed border-border bg-secondary/40 p-8 text-center">
            <h3 className="font-serif text-2xl">Fase 1 completada</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              La base de datos, la autenticación y el registro están listos. En la siguiente fase construiremos el
              listado y el detalle de cursos con el reproductor secuencial.
            </p>
            <Button asChild variant="ghost" className="mt-4">
              <Link href="/">Volver a la landing</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
