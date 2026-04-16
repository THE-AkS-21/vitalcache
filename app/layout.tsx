import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ServerStatus } from "@/components/ui/server-status"; // 1. Import it

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "VitalCache",
    description: "Clinic Management System",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        {/* 2. Add it here, outside of your main children structure */}
        <ServerStatus />

        {children}
        </body>
        </html>
    );
}