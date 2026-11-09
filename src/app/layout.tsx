import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CloudOps | Alertes et incidents",
  description: "Prototype pédagogique de gestion des alertes CloudOps",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
