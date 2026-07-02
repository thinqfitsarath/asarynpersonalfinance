import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Legacy Manager",
  description:
    "Securely store passwords and important documents for your family's future",
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
