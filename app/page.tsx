import Link from "next/link"
import Image from "next/image"
import { Award, BookOpen, CheckCircle2, PlayCircle, Sparkles, Users } from "lucide-react"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CertificatesSection />
        <CTASection />
      </main>
      <SiteFooter />
    </div>
  )
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Aprende a tu ritmo, paso a paso
          </span>

          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl">
            Cursos en video, <span className="italic text-accent">estructurados</span> para que termines lo que empiezas.
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Accede a una biblioteca de cursos profesionales, avanza de forma secuencial por cada módulo y obtén tu
            reconocimiento oficial en PDF al finalizar.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/auth/sign-up">
                Crear cuenta gratis
                <PlayCircle className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">Ya tengo cuenta</Link>
            </Button>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div className="flex flex-col">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Cursos</dt>
              <dd className="font-serif text-3xl">24+</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Profesores</dt>
              <dd className="font-serif text-3xl">12</dd>
            </div>
            <div className="flex flex-col">
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Estudiantes</dt>
              <dd className="font-serif text-3xl">1.4k</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-accent/10 blur-2xl" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <Image
              src="/hero-student.jpg"
              alt="Estudiante tomando un curso en línea desde su escritorio"
              width={900}
              height={1100}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden w-64 rounded-xl border border-border bg-card p-4 shadow-lg md:block">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Award className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium">Certificado oficial</p>
                <p className="text-xs text-muted-foreground">Descargable en PDF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      title: "Crea tu cuenta",
      body: "Regístrate en segundos con tu correo y accede a tu panel de estudiante.",
      Icon: Users,
    },
    {
      title: "Inscríbete en un curso",
      body: "Elige entre decenas de cursos organizados por categoría y nivel.",
      Icon: BookOpen,
    },
    {
      title: "Avanza paso a paso",
      body: "Los videos se desbloquean de forma secuencial para que no te pierdas nada.",
      Icon: PlayCircle,
    },
    {
      title: "Obtén tu reconocimiento",
      body: "Al terminar todos los módulos descarga tu certificado en PDF.",
      Icon: Award,
    },
  ]

  return (
    <section id="como-funciona" className="border-b border-border bg-secondary/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-4xl tracking-tight text-balance md:text-5xl">Cómo funciona</h2>
          <p className="mt-3 text-muted-foreground text-pretty">
            Una experiencia pensada para que realmente termines los cursos que empiezas.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
              <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                {i + 1}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <step.Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="font-serif text-2xl leading-tight">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    "Reproductor con seguimiento de progreso por módulo",
    "Cursos estructurados con avance secuencial",
    "Profesores verificados con perfiles públicos",
    "Sistema de calificaciones y comentarios",
    "Panel administrativo para gestionar contenidos",
    "Descarga de certificado al completar el curso",
  ]

  return (
    <section id="cursos" className="border-b border-border">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2">
        <div>
          <h2 className="font-serif text-4xl tracking-tight text-balance md:text-5xl">
            Una plataforma diseñada para <span className="italic text-accent">aprender en serio</span>.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground text-pretty">
            Todo lo que necesitas para entregar cursos en video profesionales, con trazabilidad del progreso y
            evaluación por parte de tus estudiantes.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/auth/sign-up">Comenzar ahora</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">Acceder a mi cuenta</Link>
            </Button>
          </div>
        </div>

        <ul className="grid gap-3">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-accent" aria-hidden="true" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function CertificatesSection() {
  return (
    <section id="certificados" className="border-b border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-[1.2fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium">
            <Award className="h-3.5 w-3.5" aria-hidden="true" />
            Reconocimiento oficial
          </span>
          <h2 className="mt-4 font-serif text-4xl tracking-tight text-balance md:text-5xl">
            Al terminar tu curso, recibes un <span className="italic text-accent">certificado en PDF</span>.
          </h2>
          <p className="mt-4 max-w-xl text-primary-foreground/80 text-pretty">
            Cada certificado incluye tu nombre, el curso, la fecha de finalización y un código único verificable. Lista
            para descargar, imprimir o compartir en tu perfil profesional.
          </p>
        </div>

        <div className="relative">
          <div className="rotate-[-2deg] rounded-xl border border-primary-foreground/15 bg-card p-8 text-card-foreground shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl">Aula</span>
              <Award className="h-5 w-5 text-accent" aria-hidden="true" />
            </div>
            <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">Certificado de finalización</p>
            <p className="mt-4 font-serif text-3xl leading-tight">María Rodríguez</p>
            <p className="mt-1 text-sm text-muted-foreground">ha completado el curso</p>
            <p className="mt-2 font-serif text-xl">Fundamentos de Diseño UX</p>
            <div className="mt-8 flex items-end justify-between text-xs text-muted-foreground">
              <span>22 de abril, 2026</span>
              <span className="font-mono">CODE-9F3A2B</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card px-6 py-14 text-center">
        <h2 className="font-serif text-4xl tracking-tight text-balance md:text-5xl">
          Empieza tu primer curso hoy
        </h2>
        <p className="max-w-xl text-muted-foreground text-pretty">
          Crea tu cuenta gratuita, explora la biblioteca y comienza a aprender. Sin tarjeta, sin compromiso.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Crear cuenta gratis</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
