import Link from "next/link";
import { getServerSession } from "next-auth";
import {
  KeyRound,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Check,
} from "lucide-react";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: KeyRound,
    tile: "bg-primary-soft text-primary-deep",
    title: "Password Vault",
    description:
      "Store bank, email, and other passwords with strong encryption",
  },
  {
    icon: FileText,
    tile: "bg-sun-soft text-sun-deep",
    title: "Document Manager",
    description:
      "Track insurance policies, investments, and important documents",
  },
  {
    icon: HeartHandshake,
    tile: "bg-coral-soft text-coral-deep",
    title: "Emergency Access",
    description: "Grant trusted contacts access to your vault when needed",
  },
];

const reasons = [
  "End-to-end encryption for all sensitive data",
  "Comprehensive audit logs for security tracking",
  "Time-delayed emergency access for trusted contacts",
  "Easy organization by categories (bank, insurance, investments…)",
  "A secure way to pass things on to your children when needed",
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 py-12 text-center sm:py-16">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-white">
          <ShieldCheck className="h-9 w-9" aria-hidden />
        </div>

        <h1 className="mb-3 text-3xl font-extrabold text-ink sm:text-5xl">
          Family Legacy Manager
        </h1>
        <p className="mb-8 max-w-md text-lg text-ink-soft">
          Keep your family&apos;s passwords, documents, and future plans safe
          — together, in one warm little vault.
        </p>

        <div className="mb-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <LinkButton href="/auth/register" className="sm:px-8">
            Get started
          </LinkButton>
          <LinkButton href="/auth/login" variant="secondary" className="sm:px-8">
            Sign in
          </LinkButton>
        </div>

        <div className="mb-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {features.map(({ icon: Icon, tile, title, description }) => (
            <Card key={title} className="text-left">
              <span
                className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${tile}`}
              >
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="mb-1 text-lg font-extrabold text-ink">{title}</h3>
              <p className="text-sm text-ink-soft">{description}</p>
            </Card>
          ))}
        </div>

        <Card className="w-full text-left">
          <h3 className="mb-3 text-lg font-extrabold text-ink">
            Why families love it
          </h3>
          <ul className="space-y-2.5">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2.5 text-ink-soft">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-leaf-soft text-leaf-deep">
                  <Check className="h-3.5 w-3.5" aria-hidden />
                </span>
                {reason}
              </li>
            ))}
          </ul>
        </Card>
      </main>

      <footer className="pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 text-center text-sm text-ink-faint">
        <p>© 2026 Family Legacy Manager. Your security is our priority.</p>
      </footer>
    </div>
  );
}
