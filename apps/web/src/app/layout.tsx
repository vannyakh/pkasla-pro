import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider } from "@/providers/SessionProvider";
import { AppProvider } from "@/providers/AppProvider";
import { Toaster } from "react-hot-toast";
import {
  geistSans,
  geistMono,
  beVietnamPro,
  craftyGirls,
  monsieurLaDoulaise,
  preahvihear,
  sedgwickAveDisplay,
  zenKakuGothicNew,
  moulpali,
  khangkomutt
} from "@/constants/fonts";
import { defaultMetadata } from "@/lib/metadata";

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${beVietnamPro.variable} ${craftyGirls.variable} ${monsieurLaDoulaise.variable} ${preahvihear.variable} ${sedgwickAveDisplay.variable} ${zenKakuGothicNew.variable} ${moulpali.variable} ${khangkomutt.variable} antialiased`}
      >
       <SessionProvider>
          <QueryProvider>
            <AppProvider>
              <Toaster position="top-right" />
              <main className="flex-1">{children}</main>
            </AppProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
