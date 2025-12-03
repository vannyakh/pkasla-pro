"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export default function ModernMinimalTemplate() {
  const [showCoupleQR, setShowCoupleQR] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);
  // Colors - you can update these
  const accentColor = "#f472b6"; // Soft pink for titles
  const textColor = "#ffffff"; // White for main text
  const highlightColor = "#fbbf24"; // Yellow for highlights
  const emphasisColor = "#ef4444"; // Red for emphasis

  // Fonts - you can update these
  const khmerFont = "font-preahvihear";
  const moulpaliFont = "font-moulpali";
  const khangkomuttFont = "font-khangkomutt";

  // Images - UPDATE THESE PATHS with your actual images
  const backgroundImage = "/images/assets/frame/modern-minimal.png"; // Main background
  const decorativeTopLeft = "/images/assets/frame/frame-top-left.png"; // Top left decorative
  const decorativeTopRight = "/images/assets/frame/frame-top-right.png"; // Top right decorative
  const decorativeBottomLeft = "/images/assets/frame/frame-bottom-left.png"; // Bottom left decorative
  const decorativeBottomRight = "/images/assets/frame/frame-bottom-right.png"; // Bottom right decorative
  const decorativeBorder = "/images/assets/frame/frame-bg.png"; // Bottom border
  // Butterfly decorative elements - UPDATE THESE PATHS with your butterfly images
  const butterfly1 = "/images/assets/butterfly1.png"; // Butterfly image 1
  const butterfly2 = "/images/assets/butterfly2.png"; // Butterfly image 2
  const butterfly3 = "/images/assets/butterfly3.png"; // Butterfly image 3
  const galleryImages = [
    // Photo gallery images
    "/images/gallery1.png",
    "/images/gallery2.png",
    "/images/gallery3.png",
  ];
  const qrCodeImage = "/images/KHQR-KH.png"; // QR code image for location
  const qrCodeCoupleKH = "/images/KHQR-KH.png"; // QR code for couple (Khmer)
  const qrCodeCoupleUS = "/images/KHQR-US.png"; // QR code for couple (English)
  const frameBtn = "/images/assets/frame/frame-btn.png"; // Frame for button
  const frameGuestName = "/images/assets/frame/frame-guest-name.png"; // Frame for guest name

  // Wedding information - UPDATE THESE
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

  return (
    <section
      className="overflow-hidden relative py-20 scroll-smooth min-h-screen z-10"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Decorative Elements - Fixed position during scroll with enhanced animations */}
      {decorativeTopLeft && (
        <motion.div
          className="fixed top-0 left-0 w-48 h-48 md:w-64 md:h-64 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, x: -30, y: -30, rotate: -10 }}
          animate={{
            opacity: [0, 0.6, 0.5, 0.7, 0.5],
            scale: [0.8, 1, 1, 1.05, 1],
            x: [-30, 0, 0, -5, 0],
            y: [-30, 0, 0, -5, 0],
            rotate: [-10, -5, -5, 0, -5],
          }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.2,
            times: [0, 0.2, 0.2, 0.6, 1],
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
            opacity: [0, 0.6, 0.5, 0.7, 0.5],
            scale: [0.8, 1, 1, 1.05, 1],
            x: [30, 0, 0, 5, 0],
            y: [-30, 0, 0, -5, 0],
            rotate: [10, 5, 5, 0, 5],
          }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.3,
            times: [0, 0.2, 0.2, 0.6, 1],
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
            opacity: [0, 0.6, 0.5, 0.7, 0.5],
            scale: [0.8, 1, 1, 1.05, 1],
            x: [-30, 0, 0, -5, 0],
            y: [30, 0, 0, 5, 0],
            rotate: [10, 5, 5, 0, 5],
          }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.4,
            times: [0, 0.2, 0.2, 0.6, 1],
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
            opacity: [0, 0.6, 0.5, 0.7, 0.5],
            scale: [0.8, 1, 1, 1.05, 1],
            x: [30, 0, 0, 5, 0],
            y: [30, 0, 0, 5, 0],
            rotate: [-10, -5, -5, 0, -5],
          }}
          transition={{
            duration: 5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.5,
            times: [0, 0.2, 0.2, 0.6, 1],
          }}
          style={{
            backgroundImage: `url(${decorativeBottomRight})`,
            backgroundSize: "contain",
            backgroundPosition: "bottom right",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      {decorativeBorder && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 h-32 md:h-40 z-30 pointer-events-none"
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: 0.5,
            y: 0,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
            delay: 0.6,
          }}
          style={{
            backgroundImage: `url(${decorativeBorder})`,
            backgroundSize: "cover",
            backgroundPosition: "bottom center",
            backgroundRepeat: "repeat-x",
          }}
        />
      )}

      {/* Decorative Butterflies */}
      {butterfly1 && (
        <motion.div
          className="fixed top-1/4 left-8 md:left-16 w-16 h-16 md:w-20 md:h-20 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          animate={{
            opacity: [0, 0.8, 0.6, 0.8, 0.6],
            scale: [0, 1, 1, 1.1, 1],
            x: [0, 10, -5, 15, 0],
            y: [0, -10, 5, -15, 0],
            rotate: [-45, 0, 10, -10, 0],
          }}
          transition={{
            duration: 6,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 0.8,
          }}
          style={{
            backgroundImage: `url(${butterfly1})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      {butterfly2 && (
        <motion.div
          className="fixed top-1/3 right-12 md:right-24 w-12 h-12 md:w-16 md:h-16 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0, rotate: 45 }}
          animate={{
            opacity: [0, 0.7, 0.5, 0.7, 0.5],
            scale: [0, 1, 1, 1.15, 1],
            x: [0, -8, 5, -12, 0],
            y: [0, 8, -5, 12, 0],
            rotate: [45, 0, -15, 15, 0],
          }}
          transition={{
            duration: 5.5,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 1.2,
          }}
          style={{
            backgroundImage: `url(${butterfly2})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
      {butterfly3 && (
        <motion.div
          className="fixed bottom-1/4 left-1/4 w-14 h-14 md:w-18 md:h-18 z-30 pointer-events-none"
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          animate={{
            opacity: [0, 0.6, 0.4, 0.6, 0.4],
            scale: [0, 1, 1, 1.05, 1],
            x: [0, 5, -8, 10, 0],
            y: [0, -5, 8, -10, 0],
            rotate: [-30, 0, 20, -20, 0],
          }}
          transition={{
            duration: 7,
            ease: "easeInOut",
            repeat: Infinity,
            delay: 1.8,
          }}
          style={{
            backgroundImage: `url(${butterfly3})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}

      <div
        className="container relative z-10 px-4 mx-auto max-w-6xl flex flex-col items-center justify-start py-8 overflow-y-auto"
        style={{
          maxHeight: "60vh",
          height: "60vh",
          marginTop: "20vh",
        }}
      >
        {/* Hero Section */}
        <motion.div
          className="mb-16 text-center relative w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2
            className={`relative mb-6 text-4xl ${moulpaliFont} md:text-5xl lg:text-6xl`}
            style={{ color: accentColor }}
          >
            សិរីមង្គលអាពាហ៍ពិពាហ៍
          </h2>

          {/* Guest Name - Shown Initially */}
          {!showInvitation && (
            <motion.div
              className="flex justify-center items-center flex-col gap-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="flex justify-center items-center flex-col gap-3">
                <h3
                  className={`text-3xl md:text-4xl lg:text-5xl ${khangkomuttFont}`}
                  style={{ color: textColor }}
                >
                  {brideName}
                </h3>
                <Image
                  src="/images/assets/2hearts.gif"
                  alt="Heart"
                  width={48}
                  height={48}
                  className="md:w-16 md:h-16"
                />
                <h3
                  className={`text-3xl md:text-4xl lg:text-5xl ${khangkomuttFont}`}
                  style={{ color: textColor }}
                >
                  {groomName}
                </h3>
              </div>

              <div className="flex flex-col items-center gap-4">
                <p
                  className={`text-xl md:text-2xl font-medium ${khmerFont}`}
                  style={{ color: textColor }}
                >
                  សូមគោរពអញ្ជើញ
                </p>
                <div
                  className="relative flex items-center justify-center px-8 py-6"
                  style={{
                    backgroundImage: `url(${frameGuestName})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    minWidth: "300px",
                    minHeight: "120px",
                  }}
                >
                  <h3
                    className={`text-3xl md:text-4xl lg:text-5xl ${khangkomuttFont} relative z-10`}
                    style={{ color: textColor }}
                  >
                    {guestName}
                  </h3>
                </div>
              </div>

              <motion.button
                onClick={() => setShowInvitation(true)}
                className={`px-8 py-4 font-medium ${khmerFont} flex items-center justify-center gap-3 mt-4 relative`}
                style={{
                  color: accentColor,
                  backgroundImage: `url(${frameBtn})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundColor: "transparent",
                  minWidth: "200px",
                  minHeight: "60px",
                }}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">បើកធៀប</span>
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
              <div className="flex justify-center items-center flex-col gap-3 mb-8">
                <h3
                  className={`text-3xl md:text-4xl lg:text-5xl ${khangkomuttFont}`}
                  style={{ color: textColor }}
                >
                  {brideName}
                </h3>
                <Image
                  src="/images/assets/2hearts.gif"
                  alt="Heart"
                  width={48}
                  height={48}
                  className="md:w-16 md:h-16"
                />
                <h3
                  className={`text-3xl md:text-4xl lg:text-5xl ${khangkomuttFont}`}
                  style={{ color: textColor }}
                >
                  {groomName}
                </h3>
              </div>

              {/* Invitation Text Card with Frame */}
              <motion.div
                className="relative p-6 mx-auto max-w-4xl"
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                whileInView={{
                  scale: [1, 1.02, 1],
                  filter: "blur(0px)",
                  opacity: 1,
                }}
                viewport={{ once: false, amount: 0.3 }}
                style={{
                  filter: "blur(0px)",
                }}
              >
                <p
                  className={`mb-4 text-xl md:text-2xl font-medium ${khmerFont}`}
                  style={{ color: textColor }}
                >
                  យើងខ្ញុំមានកត្តិយសសូមគោរពអញ្ជើញ
                </p>
                <p
                  className={`text-base md:text-lg lg:text-xl leading-relaxed ${khmerFont} relative z-10`}
                  style={{ color: textColor }}
                >
                  {invitationText}{" "}
                  <strong style={{ color: highlightColor }}>
                    ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍
                  </strong>{" "}
                  <span style={{ color: emphasisColor }}>
                    កូនប្រុស-កូនស្រី របស់
                  </span>{" "}
                  យើងខ្ញុំទាំងពីរ។
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Program Schedule with Frame */}
        {showInvitation && (
          <motion.div
            className="mx-auto max-w-4xl mb-16 relative w-full"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            viewport={{ once: false, amount: 0.3, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative p-8">
              <div className="relative z-10">
                <h3
                  className={`text-3xl md:text-4xl ${moulpaliFont} text-center mb-6`}
                  style={{ color: accentColor }}
                >
                  កម្មវិធីសិរីមង្គល អាពាហ៍ពិពាហ៍
                </h3>
                <div className="space-y-4">
                  {programSchedule.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: accentColor }}
                      ></div>
                      <div>
                        <p
                          className={`text-lg md:text-xl font-semibold ${khmerFont} mb-1`}
                          style={{ color: accentColor }}
                        >
                          {item.time}
                        </p>
                        <p
                          className={`text-base md:text-lg ${khmerFont}`}
                          style={{ color: textColor }}
                        >
                          {item.event}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Google Map Link with QR Code */}
        {showInvitation && googleMapLink && (
          <motion.div
            className="mx-auto max-w-4xl mb-16 relative w-full"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            viewport={{ once: false, amount: 0.3, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative p-8">
              <div className="relative z-10">
                <h3
                  className={`text-3xl md:text-4xl ${moulpaliFont} text-center mb-6`}
                  style={{ color: accentColor }}
                >
                  ទីតាំងកម្មវិធី
                </h3>

                {/* QR Code for Location */}
                {qrCodeImage && (
                  <motion.div
                    className="flex flex-col items-center gap-4 mb-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative w-48 h-48 md:w-64 md:h-64 p-4 bg-white rounded-lg">
                      <Image
                        src={qrCodeImage}
                        alt="QR Code"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                    <p
                      className={`text-base md:text-lg ${khmerFont}`}
                      style={{ color: textColor }}
                    >
                      ស្កេនដើម្បីបើកផែនទី
                    </p>
                  </motion.div>
                )}

                <motion.a
                  href={googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-lg md:text-xl flex items-center justify-center underline font-medium ${khmerFont}`}
                  style={{ color: accentColor }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  មើលទីតាំង
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Photo Gallery with Frame */}
        {showInvitation && (
          <motion.div
            className="mx-auto max-w-4xl mb-16 relative w-full"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            viewport={{ once: false, amount: 0.3, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative p-8">
              <div className="relative z-10">
                <h3
                  className={`text-3xl md:text-4xl ${moulpaliFont} text-center mb-6`}
                  style={{ color: accentColor }}
                >
                  កម្រងរូបភាពអនុស្សាវរីយ៍
                </h3>
                <p
                  className={`text-center mb-6 text-base md:text-lg ${khmerFont}`}
                  style={{ color: textColor }}
                >
                  រូបភាពសម្រាប់រំលឹក និងជាចំណងអាពាហ៍ពិពាហ៍ដ៏រឹងមាំ
                  ហើយមានសុភមង្គល សម្រាប់យើងទាំងពីរនាក់។
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {galleryImages.map((img, index) => (
                    <motion.div
                      key={index}
                      className="relative aspect-square overflow-hidden"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Thank You Letter with Frame */}
        {showInvitation && (
          <motion.div
            className="mx-auto max-w-4xl mb-16 relative w-full"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            viewport={{ once: false, amount: 0.3, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative p-8">
              <div className="relative z-10">
                <h3
                  className={`text-3xl md:text-4xl ${moulpaliFont} text-center mb-6`}
                  style={{ color: accentColor }}
                >
                  លិខិតសូមថ្លែងអំណរគុណ
                </h3>
                <p
                  className={`text-base md:text-lg lg:text-xl leading-relaxed ${khmerFont}`}
                  style={{ color: textColor }}
                >
                  ខ្ញុំបាទ នាងខ្ញុំ ជាមាតាបិតា កូនប្រុស-កូនស្រី សូមថ្លែង
                  អំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមាន ដ៏ឧត្តុង្គឧត្តម របស់សម្តេច
                  ទ្រង់ ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា ឧកញ៉ា លោកស្រី អ្នកនាង កញ្ញា
                  អញ្ជើញចូលរួមជា ភ្ញៀវកិត្តិយស ក្នុងពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍
                  កូន ប្រុស-ស្រី របស់យើងខ្ញុំ។ សូមមេត្តាទទួលនូវ សេចក្តី គោរព
                  ដ៏ខ្ពង់ខ្ពស់ពីយើងខ្ញុំ។
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Couple QR Code Section */}
        {showInvitation && (
          <motion.div
            className="mx-auto max-w-4xl mb-16 relative w-full"
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            whileInView={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            viewport={{ once: false, amount: 0.3, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative p-8">
              <div className="relative z-10">
                <div className="flex flex-col items-center gap-6">
                  {/* Clickable button */}
                  <motion.button
                    onClick={() => setShowCoupleQR(!showCoupleQR)}
                    className={`px-8 py-4 font-medium ${khmerFont} flex items-center gap-3`}
                    style={{
                      color: showCoupleQR ? "white" : accentColor,
                      backgroundColor: showCoupleQR
                        ? accentColor
                        : "transparent",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{showCoupleQR ? "✕" : "💑"}</span>
                    <span>ចំណងដៃ</span>
                  </motion.button>

                  {/* QR Codes - shown when clicked */}
                  {showCoupleQR && (
                    <motion.div
                      className="w-full"
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Khmer QR Code */}
                        {qrCodeCoupleKH && (
                          <div className="flex flex-col items-center gap-3">
                            <div className="relative w-48 h-48 md:w-64 md:h-64 p-4 bg-white">
                              <Image
                                src={qrCodeCoupleKH}
                                alt="QR Code Khmer"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <p
                              className={`text-base md:text-lg font-medium ${khmerFont}`}
                              style={{ color: textColor }}
                            >
                              ស្កេនដើម្បី​ចូលរួម​ចំណងដៃ
                            </p>
                          </div>
                        )}

                        {/* English/US QR Code */}
                        {qrCodeCoupleUS && (
                          <div className="flex flex-col items-center gap-3">
                            <div className="relative w-48 h-48 md:w-64 md:h-64 p-4 bg-white">
                              <Image
                                src={qrCodeCoupleUS}
                                alt="QR Code English"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <p
                              className={`text-base md:text-lg font-medium ${khmerFont}`}
                              style={{ color: textColor }}
                            >
                              ស្កេនដើម្បី​ចូលរួម​ចំណងដៃ
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
