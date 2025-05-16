import type { Metadata } from "next";
import { Unkempt } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import "../styles/globals.css";

const unkempt = Unkempt({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Pinoy Henyo 🇵🇭🧠💡",
  description: "Play the classic Filipino word-guessing game online!"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${unkempt.className} antialiased h-dvh`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
