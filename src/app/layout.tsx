import type { Metadata } from "next";
import "./globals.css";
import { WeatherProvider } from "@/contexts/WeatherContext";

export const metadata: Metadata = {
  metadataBase: new URL('https://moongazers.prameet.space'),
  title: "Moongazers - Best Stargazing Times",
  description: "Find the best stargazing times in your area with weather conditions and moon phases",
  openGraph: {
    title: 'Moongazers - Best Stargazing Times',
    description: 'Find the best stargazing times in your area with weather conditions and moon phases',
    images: [
      {
        url: '/moonX.png',
        width: 1200,
        height: 630,
        alt: 'Moongazers Open Graph Image',
      }
    ],
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moongazers - Best Stargazing Times',
    description: 'Find the best stargazing times in your area with weather conditions and moon phases',
    images: ['/moonX.png']
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon and Open Graph image for social sharing */}
        <link rel="icon" href="/moonX.png" />
        <meta property="og:title" content="Moongazers - Best Stargazing Times" />
        <meta property="og:description" content="Find the best stargazing times in your area with weather conditions and moon phases" />
        <meta property="og:image" content="/moonX.png" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Moongazers - Best Stargazing Times" />
        <meta name="twitter:description" content="Find the best stargazing times in your area with weather conditions and moon phases" />
        <meta name="twitter:image" content="/moonX.png" />
      </head>
      <body
        className="antialiased"
        style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif" }}
      >
        <WeatherProvider>
          {children}
        </WeatherProvider>
      </body>
    </html>
  );
}
