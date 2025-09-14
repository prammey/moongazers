import type { Metadata } from "next";
import { Kosugi_Maru } from "next/font/google";
import "./globals.css";
import { WeatherProvider } from "@/contexts/WeatherContext";

const kosugiMaru = Kosugi_Maru({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kosugi-maru",
});

export const metadata: Metadata = {
  title: "Moongazers - Best Stargazing Times",
  description: "Find the best stargazing times in your area with weather conditions and moon phases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Kosugi+Maru:wght@400&display=swap"
          rel="stylesheet"
        />
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
