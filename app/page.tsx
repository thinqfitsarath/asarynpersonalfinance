import Link from "next/link";
import { getCurrentAppUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  EyeOff,
  HeartHandshake,
  Check,
  Sparkles,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/Reveal";
import {
  HeroScene,
  SquiggleUnderline,
  SpotKeys,
  SpotDocs,
  SpotHands,
  ShieldArt,
  DottedConnector,
  DoodleKey,
  DoodleHeart,
  DoodleStar,
  DoodleDoc,
} from "@/components/illustrations";

const features = [
  {
    art: SpotKeys,
    title: "Password Vault",
    description:
      "Every family login — bank, email, phone — encrypted and organized in one cozy place.",
  },
  {
    art: SpotDocs,
    title: "Document Manager",
    description:
      "Insurance policies, investments, and the house deed. Findable in seconds, not shoeboxes.",
  },
  {
    art: SpotHands,
    title: "Emergency Access",
    description:
      "If something happens, the people you trust can reach what they need — with a time delay you control.",
  },
];

const steps = [
  {
    title: "Create your vault",
    description: "Sign up in under a minute. No card, no fuss.",
  },
  {
    title: "Add what matters",
    description: "Passwords, policies, deeds — everything encrypted as you save it.",
  },
  {
    title: "Share with someone you trust",
    description: "Add your spouse or family as trusted contacts for emergencies.",
  },
];

const securityPoints = [
  "AES-256-GCM encryption before anything touches the database",
  "A full audit log of every view, change, and sign-in",
  "Time-delayed emergency access you can always deny",
  "Your data is yours — no ads, no tracking, no selling",
];

export default async function Home() {
  const user = await getCurrentAppUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Sticky nav */}
      <header className="sticky top-0 z-20 border-b-2 border-sand bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-extrabold text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </span>
            <span className="whitespace-nowrap text-lg">Family Legacy</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="hidden min-h-11 items-center whitespace-nowrap rounded-xl px-4 font-bold text-ink-soft hover:bg-cream-deep sm:flex"
            >
              Sign in
            </Link>
            <LinkButton
              href="/signin"
              className="min-h-10 whitespace-nowrap px-4 py-2"
            >
              Get started
            </LinkButton>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-5xl items-center gap-8 px-4 pb-14 pt-10 sm:grid-cols-2 sm:pb-20 sm:pt-16">
          <div className="text-center sm:text-left">
            <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-3.5 py-1.5 text-sm font-bold text-sun-deep">
              <Sparkles className="h-4 w-4" aria-hidden />
              Made for families, not IT departments
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
              Keep what matters{" "}
              <span className="relative inline-block whitespace-nowrap">
                safe together
                <SquiggleUnderline className="absolute -bottom-2 left-0 h-3 w-full" />
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-lg text-ink-soft sm:mx-0">
              Passwords, documents, and future plans — one warm little vault
              your whole family can rely on, today and someday.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/signin" className="px-8">
                Start your vault — it&apos;s free
              </LinkButton>
              <LinkButton href="/signin" variant="secondary" className="px-8">
                Sign in
              </LinkButton>
            </div>
          </div>
          <HeroScene className="mx-auto w-full max-w-sm sm:max-w-none" />
        </section>

        {/* Trust strip */}
        <div className="border-y-2 border-sand bg-surface">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-sm font-bold text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-primary-deep" aria-hidden />
              AES-256 encryption
            </span>
            <span className="flex items-center gap-1.5">
              <EyeOff className="h-4 w-4 text-primary-deep" aria-hidden />
              Private by design
            </span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-primary-deep" aria-hidden />
              Made for families
            </span>
          </div>
        </div>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <Reveal>
            <h2 className="text-center text-3xl font-extrabold text-ink">
              Everything in its place
            </h2>
            <p className="mx-auto mt-2 max-w-md text-center text-ink-soft">
              Three simple corners of your vault, each doing one job well.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {features.map(({ art: Art, title, description }, i) => (
              <Reveal key={title} delay={i * 120}>
                <div className="h-full rounded-2xl border-2 border-sand bg-surface p-6 text-center transition-all hover:-translate-y-1 hover:border-sand-strong">
                  <Art className="mx-auto mb-4 h-24 w-24" />
                  <h3 className="mb-1.5 text-lg font-extrabold text-ink">
                    {title}
                  </h3>
                  <p className="text-sm text-ink-soft">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y-2 border-sand bg-cream-deep/60">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
            <Reveal>
              <h2 className="text-center text-3xl font-extrabold text-ink">
                Up and running in three steps
              </h2>
            </Reveal>
            <div className="mt-10 flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
              {steps.map(({ title, description }, i) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-2 sm:flex-1 sm:flex-row sm:items-start sm:gap-0"
                >
                  <Reveal delay={i * 150} className="flex-1">
                    <div className="flex max-w-56 flex-col items-center text-center">
                      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-ink bg-sun text-xl font-extrabold text-ink">
                        {i + 1}
                      </span>
                      <h3 className="font-extrabold text-ink">{title}</h3>
                      <p className="mt-1 text-sm text-ink-soft">{description}</p>
                    </div>
                  </Reveal>
                  {i < steps.length - 1 && (
                    <>
                      <DottedConnector vertical className="h-12 w-3 sm:hidden" />
                      <DottedConnector className="mt-5 hidden h-3 w-16 shrink-0 sm:block lg:w-24" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security panel */}
        <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <Reveal>
            <div className="grid items-center gap-8 rounded-3xl bg-ink p-8 sm:grid-cols-[auto_1fr] sm:p-12">
              <ShieldArt className="mx-auto h-44 w-40" />
              <div>
                <h2 className="text-center text-3xl font-extrabold text-cream sm:text-left">
                  Locked down, not locked away
                </h2>
                <ul className="mt-6 space-y-3">
                  {securityPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-cream-deep"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Check className="h-4 w-4" aria-hidden />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border-2 border-sand bg-primary-soft px-6 py-12 text-center sm:py-16">
              <DoodleKey className="anim-float absolute left-6 top-8 h-10 w-10 sm:left-14" />
              <DoodleHeart className="anim-float [animation-delay:1.1s] absolute right-8 top-10 h-9 w-9 sm:right-16" />
              <DoodleStar className="anim-float [animation-delay:2.2s] absolute bottom-8 left-12 h-8 w-8 sm:left-28" />
              <DoodleDoc className="anim-float [animation-delay:0.6s] absolute bottom-10 right-10 h-9 w-9 sm:right-24" />
              <h2 className="mx-auto max-w-lg text-3xl font-extrabold text-ink sm:text-4xl">
                Start your family vault today
              </h2>
              <p className="mx-auto mt-3 max-w-md text-ink-soft">
                Five minutes now saves your family a mountain of worry later.
              </p>
              <div className="mt-8 flex justify-center">
                <LinkButton href="/signin" className="px-10">
                  Get started — free
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-sand bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-2 font-extrabold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white">
              <ShieldCheck className="h-4 w-4" aria-hidden />
            </span>
            Family Legacy Manager
          </div>
          <p className="text-sm text-ink-faint">
            © 2026 · Your security is our priority ·{" "}
            <Link href="/signin" className="font-bold text-primary-deep">
              Sign in
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
