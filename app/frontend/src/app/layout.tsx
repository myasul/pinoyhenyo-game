import type { Metadata } from "next";
import { Unkempt } from "next/font/google";
import "../styles/globals.css";

const unkempt = Unkempt({
  weight: ["400", "700"],
  style: "normal",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Pinoy Henyo",
  description: "Play the classic Filipino word-guessing game online!",
  openGraph: {
    title: "Pinoy Henyo",
    description: "Play the classic Filipino word-guessing game online!",
    url: "https://henyo.app",
    siteName: "Pinoy Henyo",
    images: [
      {
        url: "https://henyo.app/images/henyo-logo.png",
        width: 800,
        height: 600,
        alt: "Pinoy Henyo Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@pinoyhenyo",
    title: "Pinoy Henyo",
    description: "Play the classic Filipino word-guessing game online!",
    images: ["https://henyo.app/images/henyo-logo.png"],
  },
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
