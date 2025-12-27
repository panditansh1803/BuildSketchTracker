import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BuildSketch Tracker",
  description: "Project tracking for architectural builds",
};

import GlobalBackground from "@/components/ui/GlobalBackground";

// ... (imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased h-screen bg-transparent relative`}>
        <GlobalBackground />
        <div className="relative z-10 h-full w-full overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
