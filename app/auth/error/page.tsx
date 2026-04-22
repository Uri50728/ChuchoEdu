import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl tracking-tight">Ocurrió un problema</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          No pudimos completar la autenticación. Intenta iniciar sesión de nuevo o crear una cuenta.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href="/auth/login">Volver al inicio de sesión</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Ir al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
