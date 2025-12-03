"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { X, Heart } from "lucide-react";

export default function CorporateProfessionalTemplate() {
  const [showCoupleQR, setShowCoupleQR] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);

  // Colors - Corporate Professional theme
  const primaryColor = "#1E3A8A"; // Navy blue
  const secondaryColor = "#3B82F6"; // Blue
  const accentColor = "#64748B"; // Slate gray
  const professionalBlue = "#2563EB"; // Professional blue
  const textColor = "#ffffff"; // White for main text
  const highlightColor = "#60A5FA"; // Light blue highlight

  // Fonts
  const khmerFont = "font-preahvihear";
  const moulpaliFont = "font-moulpali";
  const khangkomuttFont = "font-khangkomutt";

  // Images
  const backgroundImage = "/images/assets/corporate-professional/corporate-professional.png"; // Main background
  const decorativeTopLeft = "/images/assets/corporate-professional/frame-top-left.png";
  const decorativeTopRight = "/images/assets/corporate-professional/frame-top-right.png";
  const decorativeBottomLeft = "/images/assets/corporate-professional/frame-bottom-left.png";
  const decorativeBottomRight = "/images/assets/corporate-professional/frame-bottom-right.png";
  const decorativeBorder = "/images/assets/corporate-professional/frame-bottom.png";
  const professionalPattern = "/images/assets/professional-pattern.png"; // Professional pattern overlay
  const galleryImages = [
    "/images/gallery1.png",
    "/images/gallery2.png",
    "/images/gallery3.png",
  ];
  const qrCodeImage = "/images/KHQR-KH.png";
  const qrCodeCoupleKH = "/images/KHQR-KH.png";
  const qrCodeCoupleUS = "/images/KHQR-US.png";
  const frameBtn = "/images/assets/corporate-professional/frame-btn.png";
  const frameGuestName = "/images/assets/corporate-professional/frame-guest-name.png";

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

  return (
    <section
      className="overflow-hidden relative py-20 scroll-smooth min-h-screen z-10"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${accentColor} 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Professional Pattern Overlay */}
      {professionalPattern && (
        <motion.div
          className="fixed inset-0 z-20 pointer-events-none opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          style={{
            backgroundImage: `url(${professionalPattern})`,
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
      {decorativeBorder && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 h-32 md:h-40 z-30 pointer-events-none"
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
            backgroundSize: "cover",
            backgroundPosition: "bottom center",
            backgroundRepeat: "repeat-x",
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
            style={{ color: primaryColor }}
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
                  color: primaryColor,
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
                  <span style={{ color: accentColor }}>
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
            <div className="relative p-8 rounded-2xl">
              <div className="relative z-10">
                <h3
                  className={`text-3xl md:text-4xl ${moulpaliFont} text-center mb-6`}
                  style={{ color: primaryColor }}
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
                        className="w-3 h-3 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      ></div>
                      <div>
                        <p
                          className={`text-lg md:text-xl font-semibold ${khmerFont} mb-1`}
                          style={{ color: primaryColor }}
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
            <div className="relative p-8 rounded-2xl">
              <div className="relative z-10">
                <h3
                  className={`text-3xl md:text-4xl ${moulpaliFont} text-center mb-6`}
                  style={{ color: primaryColor }}
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
                  style={{ color: primaryColor }}
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
            <div className="relative p-8 rounded-2xl">
              <div className="relative z-10">
                <h3
                  className={`text-3xl md:text-4xl ${moulpaliFont} text-center mb-6`}
                  style={{ color: primaryColor }}
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
                      className="relative aspect-square overflow-hidden rounded-lg"
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
                        className="object-cover"
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
            <div className="relative p-8 rounded-2xl">
              <div className="relative z-10">
                <h3
                  className={`text-3xl md:text-4xl ${moulpaliFont} text-center mb-6`}
                  style={{ color: primaryColor }}
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
            <div className="relative p-8 rounded-2xl">
              <div className="relative z-10">
                <div className="flex flex-col items-center gap-6">
                  {/* Clickable button */}
                  <motion.button
                    onClick={() => setShowCoupleQR(!showCoupleQR)}
                    className={`px-8 py-4 font-medium ${khmerFont} flex items-center justify-center gap-3 relative`}
                    style={{
                      color: primaryColor,
                      backgroundImage: `url(${frameBtn})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      backgroundColor: "transparent",
                      minWidth: "200px",
                      minHeight: "60px",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showCoupleQR ? (
                      <X className="relative z-10 w-5 h-5" />
                    ) : (
                      <Heart className="relative z-10 w-5 h-5" />
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
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Khmer QR Code */}
                        {qrCodeCoupleKH && (
                          <div className="flex flex-col items-center gap-3">
                            <div className="relative w-48 h-48 md:w-64 md:h-64 p-4 bg-white rounded-lg">
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
                            <div className="relative w-48 h-48 md:w-64 md:h-64 p-4 bg-white rounded-lg">
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
