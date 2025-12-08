"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { X, Heart } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function VintageLaceTemplate() {
  const [showCoupleQR, setShowCoupleQR] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);

  // Refs for GSAP scroll animations
  const programScheduleRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const thankYouRef = useRef<HTMLDivElement>(null);
  const coupleQRRef = useRef<HTMLDivElement>(null);
  const invitationTextRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Colors - Modern Vintage Lace theme with enhanced contrast
  const primaryColor = "#8B7355"; // Brown
  const secondaryColor = "#6B5B4A"; // Darker brown
  const creamColor = "#F5F5DC"; // Cream
  const accentColor = "#D4C5B9"; // Light beige
  const textColor = "#ffffff"; // White for main text
  const highlightColor = "#C9A96E"; // Warm gold highlight
  const goldColor = "#D4AF37"; // Vintage gold
  const darkTextColor = "#2C2416"; // Dark brown for contrast
  const lightGold = "#F5E6D3"; // Light cream gold
  const strokeColor = "#E8B4B8"; // Soft vintage pink for text stroke
  const strokeColorDark = "#D4A5A5"; // Darker pink for stronger strokes

  // Fonts
  const khmerFont = "font-preahvihear";
  const moulpaliFont = "font-moulpali";
  const khangkomuttFont = "font-khangkomutt";

  // Images
  const backgroundImage = "/images/assets/vintage-lace/vintage-lace.png"; // Main background
  const decorativeTopLeft = "/images/assets/vintage-lace/frame-top-left.png";
  const decorativeTopRight = "/images/assets/vintage-lace/frame-top-right.png";
  const decorativeBottomLeft = "/images/assets/vintage-lace/frame-bottom-left.png";
  const decorativeBottomRight = "/images/assets/vintage-lace/frame-bottom-right.png";
  const decorativeBorder = "/images/assets/vintage-lace/frame-bottom.png";
  const lacePattern = "/images/assets/lace-pattern.png"; // Lace pattern overlay
  const galleryImages = [
    "/images/gallery1.png",
    "/images/gallery2.png",
    "/images/gallery3.png",
  ];
  const qrCodeImage = "/images/KHQR-KH.png";
  const qrCodeCoupleKH = "/images/KHQR-KH.png";
  const qrCodeCoupleUS = "/images/KHQR-US.png";
  const frameBtn = "/images/assets/vintage-lace/frame-btn.png";
  const frameGuestName = "/images/assets/vintage-lace/frame-guest-name.png";

  // Wedding information
  const groomName = "មន្នី ច័ន្ទផល្គុន";
  const brideName = "ម៉ៃ យូរី";
  const guestName = "សុវណ្ណ ទេពី";
  const invitationText =
    "សម្តេច ទ្រង់ ឯកឧត្តម អ្នកឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា ចូលរួមជាអធិបតី និង ជាភ្ញៀវកិត្តិយសដើម្បីប្រសិទ្ធិពរជ័យ សិរីមង្គល";
  const googleMapLink = "https://maps.google.com/";

  // Program schedule
  const programSchedule = [
    {
      time: "វេលាម៉ោង ០៦:០០-០៧:០០ព្រឹក",
      event: "ជួបជុំភ្ញៀវកិត្តិយស ដើម្បីរៀបចំហែជំនួន",
    },
    { time: "វេលាម៉ោង ០៧:០០-០៨:០០ព្រឹក", event: "ពិធីហែជំនួន(កំណត់)" },
    {
      time: "វេលាម៉ោង ០៨:០០-០៩:០០ព្រឹក",
      event: "ពិធីចៅមហានិយាយជើងការ រាប់ផ្លែឈើ",
    },
    { time: "វេលាម៉ោង ០៩:០០-១០:០០ព្រឹក", event: "ពិធីកាត់សក់បង្កក់សិរី" },
  ];

  // GSAP Scroll Animations
  useEffect(() => {
    if (typeof window === "undefined" || !showInvitation) return;

    let ctx: gsap.Context | null = null;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      // Set initial styles immediately - zoom out effect (start large, zoom to normal)
      const setInitialStyles = () => {
        if (invitationTextRef.current) {
          gsap.set(invitationTextRef.current, {
            opacity: 0,
            y: 30,
            scale: 1.15,
            filter: "blur(10px)",
          });
        }
        if (programScheduleRef.current) {
          gsap.set(programScheduleRef.current, {
            opacity: 0,
            y: 40,
            scale: 1.2,
            filter: "blur(8px)",
          });
        }
        if (locationRef.current) {
          gsap.set(locationRef.current, {
            opacity: 0,
            y: 40,
            scale: 1.2,
            filter: "blur(8px)",
          });
        }
        if (galleryRef.current) {
          gsap.set(galleryRef.current, {
            opacity: 0,
            y: 40,
            scale: 1.2,
            filter: "blur(8px)",
          });
        }
        if (thankYouRef.current) {
          gsap.set(thankYouRef.current, {
            opacity: 0,
            y: 40,
            scale: 1.2,
            filter: "blur(8px)",
          });
        }
        if (coupleQRRef.current) {
          gsap.set(coupleQRRef.current, {
            opacity: 0,
            y: 40,
            scale: 1.2,
            filter: "blur(8px)",
          });
        }
      };

      setInitialStyles();

      ctx = gsap.context(() => {
      // Animate invitation text on scroll with zoom out
      if (invitationTextRef.current) {
        gsap.to(invitationTextRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: invitationTextRef.current,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        });
      }

      // Animate program schedule on scroll with zoom out
      if (programScheduleRef.current) {
        gsap.to(programScheduleRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: programScheduleRef.current,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        });

        // Animate individual schedule items with zoom out
        const scheduleItems = programScheduleRef.current.querySelectorAll(
          ".schedule-item"
        );
        scheduleItems.forEach((item, index) => {
          gsap.set(item, {
            opacity: 0,
            x: -30,
            scale: 1.15,
          });
          gsap.to(item, {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none reverse",
              markers: false,
            },
          });
        });
      }

      // Animate location section on scroll with zoom out
      if (locationRef.current) {
        gsap.to(locationRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: locationRef.current,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        });

        // Animate QR code with zoom out
        const qrCode = locationRef.current.querySelector(".qr-code");
        if (qrCode) {
          gsap.set(qrCode, {
            opacity: 0,
            scale: 1.4,
            y: 20,
          });
          gsap.to(qrCode, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.9,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: qrCode,
              start: "top 85%",
              toggleActions: "play none none reverse",
              markers: false,
            },
          });
        }
      }

      // Animate gallery section on scroll with zoom out
      if (galleryRef.current) {
        gsap.to(galleryRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: galleryRef.current,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        });

        // Animate gallery images with zoom out
        const galleryImages = galleryRef.current.querySelectorAll(
          ".gallery-image"
        );
        galleryImages.forEach((img, index) => {
          gsap.set(img, {
            opacity: 0,
            scale: 1.3,
            y: 30,
            filter: "blur(5px)",
          });
          gsap.to(img, {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            delay: index * 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: img,
              start: "top 85%",
              toggleActions: "play none none reverse",
              markers: false,
            },
          });
        });
      }

      // Animate thank you section on scroll with zoom out
      if (thankYouRef.current) {
        gsap.to(thankYouRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: thankYouRef.current,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        });
      }

      // Animate couple QR section on scroll with zoom out
      if (coupleQRRef.current) {
        gsap.to(coupleQRRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: coupleQRRef.current,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
            markers: false,
          },
        });
      }

      // Refresh ScrollTrigger after all animations are set up
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 150);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ctx) {
        ctx.revert();
      }
      ScrollTrigger.refresh();
    };
  }, [showInvitation]);

  return (
    <section
      className="overflow-hidden relative py-20 scroll-smooth min-h-screen z-10"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : `linear-gradient(135deg, ${creamColor} 0%, ${accentColor} 50%, ${primaryColor} 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Subtle Dark Overlay for Better Text Readability on Dynamic Backgrounds */}
      <div
        className="fixed inset-0 z-15 pointer-events-none"
        style={{
          background: `linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.12) 0%,
            rgba(0, 0, 0, 0.08) 30%,
            rgba(0, 0, 0, 0.08) 70%,
            rgba(0, 0, 0, 0.15) 100%
          )`,
        }}
      />

      {/* Lace Pattern Overlay */}
      {lacePattern && (
        <motion.div
          className="fixed inset-0 z-20 pointer-events-none opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          style={{
            backgroundImage: `url(${lacePattern})`,
            backgroundRepeat: "repeat",
            backgroundSize: "300px",
          }}
        />
      )}

      {/* Decorative Elements */}
      {decorativeTopLeft && (
        <motion.div
          className="fixed top-0 left-0 w-48 h-48 md:w-64 md:h-64 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, x: -30, y: -30, rotate: -10 }}
          animate={{
            opacity: 1,
            scale: [1, 1.02, 1],
            x: [0, -2, 0],
            y: [0, -2, 0],
            rotate: [0, -2, 0],
          }}
          transition={{
            opacity: {
              duration: 1,
              ease: "easeOut",
              delay: 0.2,
            },
            scale: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.2,
            },
            x: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.2,
            },
            y: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.2,
            },
            rotate: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.2,
            },
          }}
          style={{
            backgroundImage: `url(${decorativeTopLeft})`,
            backgroundSize: "contain",
            backgroundPosition: "top left",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      {decorativeTopRight && (
        <motion.div
          className="fixed top-0 right-0 w-48 h-48 md:w-64 md:h-64 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, x: 30, y: -30, rotate: 10 }}
          animate={{
            opacity: 1,
            scale: [1, 1.02, 1],
            x: [0, 2, 0],
            y: [0, -2, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            opacity: {
              duration: 1,
              ease: "easeOut",
              delay: 0.3,
            },
            scale: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.3,
            },
            x: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.3,
            },
            y: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.3,
            },
            rotate: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.3,
            },
          }}
          style={{
            backgroundImage: `url(${decorativeTopRight})`,
            backgroundSize: "contain",
            backgroundPosition: "top right",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      {decorativeBottomLeft && (
        <motion.div
          className="fixed bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, x: -30, y: 30, rotate: 10 }}
          animate={{
            opacity: 1,
            scale: [1, 1.02, 1],
            x: [0, -2, 0],
            y: [0, 2, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            opacity: {
              duration: 1,
              ease: "easeOut",
              delay: 0.4,
            },
            scale: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.4,
            },
            x: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.4,
            },
            y: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.4,
            },
            rotate: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.4,
            },
          }}
          style={{
            backgroundImage: `url(${decorativeBottomLeft})`,
            backgroundSize: "contain",
            backgroundPosition: "bottom left",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      {decorativeBottomRight && (
        <motion.div
          className="fixed bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, x: 30, y: 30, rotate: -10 }}
          animate={{
            opacity: 1,
            scale: [1, 1.02, 1],
            x: [0, 2, 0],
            y: [0, 2, 0],
            rotate: [0, -2, 0],
          }}
          transition={{
            opacity: {
              duration: 1,
              ease: "easeOut",
              delay: 0.5,
            },
            scale: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.5,
            },
            x: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.5,
            },
            y: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.5,
            },
            rotate: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.5,
            },
          }}
          style={{
            backgroundImage: `url(${decorativeBottomRight})`,
            backgroundSize: "contain",
            backgroundPosition: "bottom right",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      {/* Bottom Decorative Border */}
      {decorativeBorder && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 h-64 z-30 pointer-events-none"
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: 1,
            y: [0, -2, 0],
          }}
          transition={{
            opacity: {
              duration: 1,
              ease: "easeOut",
              delay: 0.6,
            },
            y: {
              duration: 4,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.6,
            },
          }}
            style={{
            backgroundImage: `url(${decorativeBorder})`,
            backgroundSize: "contain",
            backgroundPosition: "bottom center",
            backgroundRepeat: "repeat-x",
            }}
          />
        )}

      <div
        ref={containerRef}
        className="container relative z-10 px-4 mx-auto max-w-6xl flex flex-col items-center justify-start py-8"
      >
        {/* Hero Section */}
        <motion.div
          className="mb-20 text-center relative w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h2
            className={`relative mb-8 text-4xl ${moulpaliFont} md:text-5xl lg:text-6xl xl:text-7xl font-bold`}
            style={{ 
              color: textColor,
              WebkitTextStroke: `2px ${strokeColorDark}`,
              paintOrder: "stroke fill",
              letterSpacing: "0.05em"
            } as React.CSSProperties}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            សិរីមង្គលអាពាហ៍ពិពាហ៍
          </motion.h2>

          {/* Guest Name - Shown Initially */}
          {!showInvitation && (
            <motion.div
              className="flex justify-center items-center flex-col gap-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="flex justify-center items-center flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.h3
                  className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl ${khangkomuttFont} font-bold`}
                  style={{ 
                    color: textColor,
                    WebkitTextStroke: `1.5px ${strokeColorDark}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {brideName}
                </motion.h3>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 10,
                    delay: 0.4 
                  }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  <Image
                    src="/images/assets/2hearts.gif"
                    alt="Heart"
                    width={64}
                    height={64}
                    className="md:w-20 md:h-20 drop-shadow-lg"
                  />
                </motion.div>
                <motion.h3
                  className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl ${khangkomuttFont} font-bold`}
                  style={{ 
                    color: textColor,
                    WebkitTextStroke: `1.5px ${strokeColorDark}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {groomName}
                </motion.h3>
              </motion.div>

              <motion.div 
                className="flex flex-col items-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.p
                  className={`text-xl md:text-2xl lg:text-3xl font-semibold ${khmerFont}`}
                  style={{ 
                    color: highlightColor,
                    WebkitTextStroke: `1.5px ${strokeColor}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  សូមគោរពអញ្ជើញ
                </motion.p>
                <motion.div
                  className="relative flex items-center justify-center px-10 py-8"
                  style={{
                    backgroundImage: `url(${frameGuestName})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    minWidth: "320px",
                    minHeight: "140px",
                    filter: "drop-shadow(0 8px 24px rgba(139, 115, 85, 0.4))",
                  }}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.6 
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <h3
                    className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl ${khangkomuttFont} relative z-10 font-bold`}
                    style={{ 
                      color: textColor,
                      textShadow: `0 2px 12px rgba(139, 115, 85, 0.6), 0 1px 4px rgba(0, 0, 0, 0.4)`
                    }}
                  >
                    {guestName}
                  </h3>
                </motion.div>
              </motion.div>

              <motion.button
                onClick={() => setShowInvitation(true)}
                className={`px-10 py-5 font-semibold text-lg md:text-xl ${khmerFont} flex items-center justify-center gap-3 mt-6 relative`}
                style={{
                  color: textColor,
                  backgroundImage: `url(${frameBtn})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "transparent",
                  minWidth: "240px",
                  minHeight: "70px",
                  filter: "drop-shadow(0 6px 20px rgba(139, 115, 85, 0.5))",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{
                  scale: 1.08,
                  filter: "drop-shadow(0 8px 24px rgba(139, 115, 85, 0.7))",
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10" style={{ textShadow: `0 2px 8px rgba(0, 0, 0, 0.3)` }}>
                  បើកធៀប
                </span>
              </motion.button>
            </motion.div>
          )}

          {/* Couple Names and Invitation - Shown after clicking button */}
          {showInvitation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div 
                className="flex justify-center items-center flex-col gap-4 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.h3
                  className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl ${khangkomuttFont} font-bold`}
                  style={{ 
                    color: textColor,
                    WebkitTextStroke: `1.5px ${strokeColorDark}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {brideName}
                </motion.h3>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 10,
                    delay: 0.2 
                  }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  <Image
                    src="/images/assets/2hearts.gif"
                    alt="Heart"
                    width={64}
                    height={64}
                    className="md:w-20 md:h-20 drop-shadow-lg"
                  />
                </motion.div>
                <motion.h3
                  className={`text-3xl md:text-4xl lg:text-5xl xl:text-6xl ${khangkomuttFont} font-bold`}
                  style={{ 
                    color: textColor,
                    WebkitTextStroke: `1.5px ${strokeColorDark}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {groomName}
                </motion.h3>
              </motion.div>

              {/* Invitation Text Card with Enhanced Glassmorphism */}
              <motion.div
                ref={invitationTextRef}
                className="relative p-8 md:p-12 mx-auto max-w-5xl rounded-3xl"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(0, 0, 0, 0.35) 0%, 
                    rgba(0, 0, 0, 0.3) 50%, 
                    rgba(0, 0, 0, 0.35) 100%
                  ),
                  linear-gradient(135deg, 
                    rgba(139, 115, 85, 0.2) 0%, 
                    rgba(212, 175, 55, 0.15) 50%, 
                    rgba(139, 115, 85, 0.2) 100%
                  )`,
                  border: `2px solid rgba(212, 175, 55, 0.45)`,
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.15),
                    0 0 0 1px rgba(0, 0, 0, 0.1)`,
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.p
                  className={`mb-6 text-2xl md:text-3xl lg:text-4xl font-bold ${khmerFont} text-center`}
                  style={{ 
                    color: highlightColor,
                    WebkitTextStroke: `1.5px ${strokeColor}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                >
                  យើងខ្ញុំមានកត្តិយសសូមគោរពអញ្ជើញ
                </motion.p>
                <p
                  className={`text-lg md:text-xl lg:text-2xl leading-relaxed ${khmerFont} relative z-10 text-center`}
                  style={{ 
                    color: textColor,
                    WebkitTextStroke: `1px ${strokeColor}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                >
                  {invitationText}{" "}
                  <strong style={{ 
                    color: highlightColor,
                    textShadow: `0 2px 8px rgba(212, 175, 55, 0.5)`
                  }}>
                    ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍
                  </strong>{" "}
                  <span style={{ color: accentColor }}>
                    កូនប្រុស-កូនស្រី របស់
                  </span>{" "}
                  យើងខ្ញុំទាំងពីរ។
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Program Schedule with Modern Card Design */}
        {showInvitation && (
          <div
            ref={programScheduleRef}
            className="mx-auto max-w-5xl mb-20 relative w-full"
          >
            <motion.div 
              className="relative p-8 md:p-12 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(0, 0, 0, 0.35) 0%, 
                  rgba(0, 0, 0, 0.3) 50%, 
                  rgba(0, 0, 0, 0.35) 100%
                ),
                linear-gradient(135deg, 
                  rgba(139, 115, 85, 0.2) 0%, 
                  rgba(212, 175, 55, 0.15) 50%, 
                  rgba(139, 115, 85, 0.2) 100%
                )`,
                border: `2px solid rgba(212, 175, 55, 0.45)`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.15),
                  0 0 0 1px rgba(0, 0, 0, 0.1)`,
              }}
            >
              <div className="relative z-10">
                <motion.h3
                  className={`text-3xl md:text-4xl lg:text-5xl ${moulpaliFont} text-center mb-10 font-bold`}
                  style={{ 
                    color: highlightColor,
                    WebkitTextStroke: `1.5px ${strokeColorDark}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  កម្មវិធីសិរីមង្គល អាពាហ៍ពិពាហ៍
                </motion.h3>
                <div className="space-y-6">
                  {programSchedule.map((item, index) => (
                    <motion.div
                      key={index}
                      className="schedule-item flex items-start gap-6 p-6 rounded-2xl transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, 
                          rgba(0, 0, 0, 0.25) 0%, 
                          rgba(0, 0, 0, 0.2) 100%
                        ),
                        linear-gradient(135deg, 
                          rgba(212, 175, 55, 0.12) 0%, 
                          rgba(139, 115, 85, 0.08) 100%
                        )`,
                        border: `1px solid rgba(212, 175, 55, 0.35)`,
                        boxShadow: `0 4px 16px rgba(0, 0, 0, 0.25)`,
                      }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: `0 6px 24px rgba(139, 115, 85, 0.3)`,
                        borderColor: `rgba(212, 175, 55, 0.4)`,
                      }}
                    >
                      <motion.div
                        className="w-4 h-4 rounded-full mt-2 shrink-0"
                        style={{ 
                          backgroundColor: highlightColor,
                          boxShadow: `0 0 12px ${highlightColor}`
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                      ></motion.div>
                      <div className="flex-1">
                        <p
                          className={`text-lg md:text-xl lg:text-2xl font-bold ${khmerFont} mb-2`}
                          style={{ 
                            color: highlightColor,
                            WebkitTextStroke: `1px ${strokeColor}`,
                            paintOrder: "stroke fill"
                          } as React.CSSProperties}
                        >
                          {item.time}
                        </p>
                        <p
                          className={`text-base md:text-lg lg:text-xl ${khmerFont}`}
                          style={{ 
                            color: textColor,
                            WebkitTextStroke: `1px ${strokeColor}`,
                            paintOrder: "stroke fill"
                          } as React.CSSProperties}
                        >
                          {item.event}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Google Map Link with QR Code */}
        {showInvitation && googleMapLink && (
          <div
            ref={locationRef}
            className="mx-auto max-w-5xl mb-20 relative w-full"
          >
            <motion.div 
              className="relative p-8 md:p-12 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(0, 0, 0, 0.35) 0%, 
                  rgba(0, 0, 0, 0.3) 50%, 
                  rgba(0, 0, 0, 0.35) 100%
                ),
                linear-gradient(135deg, 
                  rgba(139, 115, 85, 0.2) 0%, 
                  rgba(212, 175, 55, 0.15) 50%, 
                  rgba(139, 115, 85, 0.2) 100%
                )`,
                border: `2px solid rgba(212, 175, 55, 0.45)`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.15),
                  0 0 0 1px rgba(0, 0, 0, 0.1)`,
              }}
            >
              <div className="relative z-10">
                <motion.h3
                  className={`text-3xl md:text-4xl lg:text-5xl ${moulpaliFont} text-center mb-10 font-bold`}
                  style={{ 
                    color: highlightColor,
                    WebkitTextStroke: `1.5px ${strokeColorDark}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  ទីតាំងកម្មវិធី
                </motion.h3>

                {/* QR Code for Location */}
                {qrCodeImage && (
                  <motion.div 
                    className="qr-code flex flex-col items-center gap-6 mb-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <motion.div 
                      className="relative w-56 h-56 md:w-72 md:h-72 p-6 bg-white rounded-2xl shadow-2xl"
                      style={{
                        boxShadow: `0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(212, 175, 55, 0.2)`,
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: `0 16px 48px rgba(139, 115, 85, 0.4), 0 0 0 6px rgba(212, 175, 55, 0.3)`,
                      }}
                    >
                      <Image
                        src={qrCodeImage}
                        alt="QR Code"
                        fill
                        className="object-contain rounded-xl"
                      />
                    </motion.div>
                    <motion.p
                      className={`text-lg md:text-xl font-semibold ${khmerFont}`}
                      style={{ 
                        color: textColor,
                        WebkitTextStroke: `1px ${strokeColor}`,
                        paintOrder: "stroke fill"
                      } as React.CSSProperties}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      ស្កេនដើម្បីបើកផែនទី
                    </motion.p>
                  </motion.div>
                )}

                <motion.a
                  href={googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-lg md:text-xl lg:text-2xl flex items-center justify-center font-bold ${khmerFont} px-8 py-4 rounded-xl transition-all duration-300`}
                  style={{ 
                    color: textColor,
                    background: `linear-gradient(135deg, ${highlightColor} 0%, ${goldColor} 100%)`,
                    textShadow: `0 2px 8px rgba(0, 0, 0, 0.3)`,
                    boxShadow: `0 6px 20px rgba(139, 115, 85, 0.4)`,
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: `0 8px 28px rgba(139, 115, 85, 0.6)`,
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  មើលទីតាំង
                </motion.a>
              </div>
            </motion.div>
          </div>
        )}

        {/* Photo Gallery with Modern Grid */}
        {showInvitation && (
          <div
            ref={galleryRef}
            className="mx-auto max-w-6xl mb-20 relative w-full"
          >
            <motion.div 
              className="relative p-8 md:p-12 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(0, 0, 0, 0.35) 0%, 
                  rgba(0, 0, 0, 0.3) 50%, 
                  rgba(0, 0, 0, 0.35) 100%
                ),
                linear-gradient(135deg, 
                  rgba(139, 115, 85, 0.2) 0%, 
                  rgba(212, 175, 55, 0.15) 50%, 
                  rgba(139, 115, 85, 0.2) 100%
                )`,
                border: `2px solid rgba(212, 175, 55, 0.45)`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.15),
                  0 0 0 1px rgba(0, 0, 0, 0.1)`,
              }}
            >
              <div className="relative z-10">
                <motion.h3
                  className={`text-3xl md:text-4xl lg:text-5xl ${moulpaliFont} text-center mb-6 font-bold`}
                  style={{ 
                    color: highlightColor,
                    WebkitTextStroke: `1.5px ${strokeColorDark}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  កម្រងរូបភាពអនុស្សាវរីយ៍
                </motion.h3>
                <motion.p
                  className={`text-center mb-10 text-lg md:text-xl lg:text-2xl ${khmerFont} leading-relaxed`}
                  style={{ 
                    color: textColor,
                    WebkitTextStroke: `1px ${strokeColor}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  រូបភាពសម្រាប់រំលឹក និងជាចំណងអាពាហ៍ពិពាហ៍ដ៏រឹងមាំ
                  ហើយមានសុភមង្គល សម្រាប់យើងទាំងពីរនាក់។
                </motion.p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {galleryImages.map((img, index) => (
                    <motion.div
                      key={index}
                      className="gallery-image relative aspect-square overflow-hidden rounded-2xl group cursor-pointer"
                      style={{
                        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.3)`,
                        border: `2px solid rgba(212, 175, 55, 0.2)`,
                      }}
                      initial={{ opacity: 0, scale: 0.8, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: index * 0.15,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ 
                        scale: 1.08,
                        boxShadow: `0 12px 40px rgba(139, 115, 85, 0.5)`,
                        borderColor: `rgba(212, 175, 55, 0.5)`,
                        zIndex: 10
                      }}
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div 
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Thank You Letter with Modern Design */}
        {showInvitation && (
          <div
            ref={thankYouRef}
            className="mx-auto max-w-5xl mb-20 relative w-full"
          >
            <motion.div 
              className="relative p-8 md:p-12 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(0, 0, 0, 0.35) 0%, 
                  rgba(0, 0, 0, 0.3) 50%, 
                  rgba(0, 0, 0, 0.35) 100%
                ),
                linear-gradient(135deg, 
                  rgba(139, 115, 85, 0.2) 0%, 
                  rgba(212, 175, 55, 0.15) 50%, 
                  rgba(139, 115, 85, 0.2) 100%
                )`,
                border: `2px solid rgba(212, 175, 55, 0.45)`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.15),
                  0 0 0 1px rgba(0, 0, 0, 0.1)`,
              }}
            >
              <div className="relative z-10">
                <motion.h3
                  className={`text-3xl md:text-4xl lg:text-5xl ${moulpaliFont} text-center mb-10 font-bold`}
                  style={{ 
                    color: highlightColor,
                    WebkitTextStroke: `1.5px ${strokeColorDark}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  លិខិតសូមថ្លែងអំណរគុណ
                </motion.h3>
                <motion.p
                  className={`text-lg md:text-xl lg:text-2xl leading-relaxed ${khmerFont} text-center`}
                  style={{ 
                    color: textColor,
                    WebkitTextStroke: `1px ${strokeColor}`,
                    paintOrder: "stroke fill"
                  } as React.CSSProperties}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  ខ្ញុំបាទ នាងខ្ញុំ ជាមាតាបិតា កូនប្រុស-កូនស្រី សូមថ្លែង
                  អំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមាន ដ៏ឧត្តុង្គឧត្តម របស់សម្តេច
                  ទ្រង់ ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា ឧកញ៉ា លោកស្រី អ្នកនាង កញ្ញា
                  អញ្ជើញចូលរួមជា ភ្ញៀវកិត្តិយស ក្នុងពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍
                  កូន ប្រុស-ស្រី របស់យើងខ្ញុំ។ សូមមេត្តាទទួលនូវ សេចក្តី គោរព
                  ដ៏ខ្ពង់ខ្ពស់ពីយើងខ្ញុំ។
                </motion.p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Couple QR Code Section */}
        {showInvitation && (
          <div
            ref={coupleQRRef}
            className="mx-auto max-w-5xl mb-20 relative w-full"
          >
            <motion.div 
              className="relative p-8 md:p-12 rounded-3xl"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(0, 0, 0, 0.35) 0%, 
                  rgba(0, 0, 0, 0.3) 50%, 
                  rgba(0, 0, 0, 0.35) 100%
                ),
                linear-gradient(135deg, 
                  rgba(139, 115, 85, 0.2) 0%, 
                  rgba(212, 175, 55, 0.15) 50%, 
                  rgba(139, 115, 85, 0.2) 100%
                )`,
                border: `2px solid rgba(212, 175, 55, 0.45)`,
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 
                  inset 0 1px 0 rgba(255, 255, 255, 0.15),
                  0 0 0 1px rgba(0, 0, 0, 0.1)`,
              }}
            >
              <div className="relative z-10">
                <div className="flex flex-col items-center gap-8">
                  {/* Clickable button */}
                  <motion.button
                    onClick={() => setShowCoupleQR(!showCoupleQR)}
                    className={`px-10 py-5 font-bold text-lg md:text-xl ${khmerFont} flex items-center justify-center gap-3 relative`}
                    style={{
                      color: textColor,
                      backgroundImage: `url(${frameBtn})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundColor: "transparent",
                      minWidth: "240px",
                      minHeight: "70px",
                      filter: "drop-shadow(0 6px 20px rgba(139, 115, 85, 0.5))",
                      textShadow: `0 2px 8px rgba(0, 0, 0, 0.3)`,
                    }}
                    whileHover={{ 
                      scale: 1.08,
                      filter: "drop-shadow(0 8px 24px rgba(139, 115, 85, 0.7))",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showCoupleQR ? (
                      <X className="relative z-10 w-6 h-6" />
                    ) : (
                      <Heart className="relative z-10 w-6 h-6" />
                    )}
                    <span className="relative z-10">ចំណងដៃ</span>
                  </motion.button>

                  {/* QR Codes - shown when clicked */}
                  {showCoupleQR && (
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ 
                        duration: 0.5,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Khmer QR Code */}
                        {qrCodeCoupleKH && (
                          <motion.div 
                            className="flex flex-col items-center gap-4"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                          >
                            <motion.div 
                              className="relative w-56 h-56 md:w-72 md:h-72 p-6 bg-white rounded-2xl shadow-2xl"
                              style={{
                                boxShadow: `0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(212, 175, 55, 0.2)`,
                              }}
                              whileHover={{ 
                                scale: 1.05,
                                boxShadow: `0 16px 48px rgba(139, 115, 85, 0.4), 0 0 0 6px rgba(212, 175, 55, 0.3)`,
                              }}
                            >
                              <Image
                                src={qrCodeCoupleKH}
                                alt="QR Code Khmer"
                                fill
                                className="object-contain rounded-xl"
                              />
                            </motion.div>
                            <p
                              className={`text-lg md:text-xl font-semibold ${khmerFont}`}
                              style={{ 
                                color: textColor,
                                textShadow: `0 2px 8px rgba(0, 0, 0, 0.3)`
                              }}
                            >
                              ស្កេនដើម្បី​ចូលរួម​ចំណងដៃ
                            </p>
                          </motion.div>
                        )}

                        {/* English/US QR Code */}
                        {qrCodeCoupleUS && (
                          <motion.div 
                            className="flex flex-col items-center gap-4"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                          >
                            <motion.div 
                              className="relative w-56 h-56 md:w-72 md:h-72 p-6 bg-white rounded-2xl shadow-2xl"
                              style={{
                                boxShadow: `0 12px 40px rgba(0, 0, 0, 0.3), 0 0 0 4px rgba(212, 175, 55, 0.2)`,
                              }}
                              whileHover={{ 
                                scale: 1.05,
                                boxShadow: `0 16px 48px rgba(139, 115, 85, 0.4), 0 0 0 6px rgba(212, 175, 55, 0.3)`,
                              }}
                            >
                              <Image
                                src={qrCodeCoupleUS}
                                alt="QR Code English"
                                fill
                                className="object-contain rounded-xl"
                              />
                            </motion.div>
                            <p
                              className={`text-lg md:text-xl font-semibold ${khmerFont}`}
                              style={{ 
                                color: textColor,
                                textShadow: `0 2px 8px rgba(0, 0, 0, 0.3)`
                              }}
                            >
                              ស្កេនដើម្បី​ចូលរួម​ចំណងដៃ
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
