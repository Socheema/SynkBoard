import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from 'sonner';
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-bricolage",
});

export const metadata = {
  title: 'SynkBoard - AI-Powered Collaboration',
  description: 'Real-time collaborative dashboard with AI assistance',
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={bricolage.className}>
          <ErrorBoundary>
          <ThemeProvider>{children}</ThemeProvider>
           <Toaster position="bottom-right" richColors />
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
