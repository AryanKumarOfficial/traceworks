import type {Metadata} from "next";
import "./globals.css";
import {Inter} from "next/font/google"

const inter = Inter({
    subsets: ["latin"],
    variable: "---font-sans"
})

export const metadata: Metadata = {
    title: "Traceworks",
    description: "Traceworks Assigment",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
        <body
            className={`antialiased`}
        >
        {children}
        </body>
        </html>
    );
}
