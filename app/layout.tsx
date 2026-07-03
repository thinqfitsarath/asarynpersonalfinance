import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "@fontsource-variable/baloo-2";
import "./globals.css";

const SITE_URL = "https://family-legacy-manager.netlify.app";
const DESCRIPTION =
  "A warm little vault your whole family can rely on — passwords, documents, and future plans, kept safe together.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Family Legacy — keep what matters safe, together",
    template: "%s · Family Legacy",
  },
  description: DESCRIPTION,
  applicationName: "Family Legacy",
  openGraph: {
    type: "website",
    siteName: "Family Legacy",
    title: "Family Legacy — keep what matters safe, together",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Family Legacy — keep what matters safe, together",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf6ee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
