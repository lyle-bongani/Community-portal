import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PostsProvider } from "@/context/PostsContext";
import { EventsProvider } from "@/context/EventsContext";
import { WebSocketProvider } from "@/context/WebSocketContext";
import NotificationToast from "@/components/common/NotificationToast";
import FontLoader from "@/components/FontLoader";
import "@/lib/test-connection"; // Make test function available in browser console

export const metadata: Metadata = {
  title: "Community Portal",
  description: "A community portal for posts and events",
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <body className="antialiased bg-white font-sans">
        <FontLoader />
        <WebSocketProvider>
          <AuthProvider>
            <PostsProvider>
              <EventsProvider>
                <NotificationToast />
        {children}
              </EventsProvider>
            </PostsProvider>
          </AuthProvider>
        </WebSocketProvider>
      </body>
    </html>
  );
}
