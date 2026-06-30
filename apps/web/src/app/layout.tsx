import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "@kanban/styles";
import { ThemeProvider } from "@/context/ThemeContext";
import WorkspaceLayout from "@/components/WorkspaceLayout";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevFlow // Kanban Board for Developers",
  description: "A high-fidelity, responsive Kanban board tailored for developer sprints, branch mapping, and keyboard efficiency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground font-sans">
        <ThemeProvider>
          <WorkspaceLayout>{children}</WorkspaceLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
