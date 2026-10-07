import type { Metadata } from "next"
import { Lora, DM_Sans } from "next/font/google"
import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/query-provider"
import { cn } from "@workspace/ui/lib/utils"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "LinguaClass — AI Lesson Intelligence for Language Teachers",
  description:
    "LinguaClass turns live language lesson transcripts into structured, teacher-reviewed learning records with vocabulary banks, grammar corrections, and personalized practice.",
  keywords: [
    "language learning",
    "teacher software",
    "lesson intelligence",
    "language tutor",
    "CEFR",
    "AI language transcription",
    "student notes",
  ],
  authors: [{ name: "LinguaClass" }],
  openGraph: {
    title: "LinguaClass — AI Lesson Intelligence for Language Teachers",
    description:
      "Turn live language lessons into structured, teacher-verified learning records. AI proposes, teacher decides.",
    type: "website",
    siteName: "LinguaClass",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", dmSans.variable, lora.variable)}
    >
      <body className="bg-page text-ink antialiased selection:bg-teal-light selection:text-teal-dark">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
