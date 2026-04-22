import Link from "next/link"
import { GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/user-menu"

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: { full_name: string | null; role: string } | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-serif text-2xl leading-none tracking-tight">Aula</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
          <Link href="/#cursos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Cursos
          </Link>
          <Link href="/#como-funciona" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Cómo funciona
          </Link>
          <Link href="/#certificados" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Certificados
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu email={user.email ?? ""} fullName={profile?.full_name ?? null} role={profile?.role ?? "student"} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Registrarme</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
