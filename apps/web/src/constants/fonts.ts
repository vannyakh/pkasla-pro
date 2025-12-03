import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

// Google Fonts
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Be Vietnam Pro - Multiple weights and styles
export const beVietnamPro = localFont({
  src: [
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-ThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-ExtraLightItalic.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-ExtraBoldItalic.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Be_Vietnam_Pro/BeVietnamPro-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

// Crafty Girls
export const craftyGirls = localFont({
  src: "../../public/fonts/Crafty_Girls/CraftyGirls-Regular.ttf",
  variable: "--font-crafty-girls",
  display: "swap",
});

// Monsieur La Doulaise
export const monsieurLaDoulaise = localFont({
  src: "../../public/fonts/Monsieur_La_Doulaise/MonsieurLaDoulaise-Regular.ttf",
  variable: "--font-monsieur-la-doulaise",
  display: "swap",
});

// Preahvihear
export const preahvihear = localFont({
  src: "../../public/fonts/Preahvihear/Preahvihear-Regular.ttf",
  variable: "--font-preahvihear",
  display: "swap",
});

// Sedgwick Ave Display
export const sedgwickAveDisplay = localFont({
  src: "../../public/fonts/Sedgwick_Ave_Display/SedgwickAveDisplay-Regular.ttf",
  variable: "--font-sedgwick-ave-display",
  display: "swap",
});

// Zen Kaku Gothic New
export const zenKakuGothicNew = localFont({
  src: [
    {
      path: "../../public/fonts/Zen_Kaku_Gothic_New/ZenKakuGothicNew-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Zen_Kaku_Gothic_New/ZenKakuGothicNew-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Zen_Kaku_Gothic_New/ZenKakuGothicNew-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Zen_Kaku_Gothic_New/ZenKakuGothicNew-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Zen_Kaku_Gothic_New/ZenKakuGothicNew-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-zen-kaku-gothic-new",
  display: "swap",
});

// Moulpali 
export const moulpali = localFont({
  src: "../../public/fonts/Moulpali/Moulpali-Regular.ttf",
  variable: "--font-moulpali",
  display: "swap",
});
