import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ServerStatus } from "@/components/ui/server-status"; // 1. Import it

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "VitalCache",
    description: "Clinic Management System",
};

import { GoogleOAuthProvider } from '@react-oauth/google';

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "placeholder-client-id.apps.googleusercontent.com";
    return (
        <html lang="en">
        <body className={inter.className}>
        <GoogleOAuthProvider clientId={googleClientId}>
            {/* 2. Add it here, outside of your main children structure */}
            <ServerStatus />

            {children}
        </GoogleOAuthProvider>
        </body>
        </html>
    );
}