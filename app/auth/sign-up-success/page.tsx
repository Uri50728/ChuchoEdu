import Link from "next/link"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-8 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
        <MailCheck className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl tracking-tight">Revisa tu correo</h1>
        <p className="text-sm text-muted-foreground text-pretty">
          Te enviamos un enlace de confirmación. Haz clic en el enlace desde tu correo para activar tu cuenta y luego
          inicia sesión.
        </p>
      </div>
      <Button asChild>
        <Link href="/auth/login">Ir a iniciar sesión</Link>
      </Button>
    </div>
  )
}
