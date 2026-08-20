import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://abcis-schoolos.siamahmedgotthis.chatgpt.site"),
  title: "ABCIS SchoolOS",
  description: "The connected school management workspace for ABC International School.",
  openGraph: {
    title: "ABCIS SchoolOS",
    description: "Everything connected — learning, administration and campus life.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ABCIS SchoolOS",
    description: "Everything connected — learning, administration and campus life.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/abcis-logo.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/abcis-logo.png",
    apple: "/abcis-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/abcis-logo.png" type="image/png" />
        <link rel="shortcut icon" href="/abcis-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/abcis-logo.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
