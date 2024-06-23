import PageImagesProvider from "@/app/context/PageImagesProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FreeFillableForms.ai",
  description:
    "Upload your state government's Medicaid application form and we'll help you fill it 2x faster out with information you already have.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PageImagesProvider>{children}</PageImagesProvider>
      </body>
    </html>
  );
}
