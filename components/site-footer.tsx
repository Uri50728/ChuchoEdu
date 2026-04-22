import Link from "next/link"
import { GraduationCap } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-serif text-xl">Aula</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Footer">
          <Link href="/#cursos" className="hover:text-foreground">
            Cursos
          </Link>
          <Link href="/#como-funciona" className="hover:text-foreground">
            Cómo funciona
          </Link>
          <Link href="/auth/login" className="hover:text-foreground">
            Iniciar sesión
          </Link>
          <Link href="/auth/sign-up" className="hover:text-foreground">
            Registrarme
          </Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Aula. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
