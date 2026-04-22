"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success("Bienvenido de vuelta")
    router.push(next)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-serif text-4xl tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar tus cursos</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
          </div>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tu contraseña"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {"¿No tienes cuenta? "}
        <Link href="/auth/sign-up" className="font-medium text-primary underline-offset-4 hover:underline">
          Crear una cuenta
        </Link>
      </p>
    </div>
  )
}
