import type { Metadata } from "next";
import { Unkempt } from "next/font/google";
import "../styles/globals.css";

const unkempt = Unkempt({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Pinoy Henyo 💡🧠",
  description: "Play Pinoy Henyo online for free!",
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
      </body>
    </html>
  );
}
