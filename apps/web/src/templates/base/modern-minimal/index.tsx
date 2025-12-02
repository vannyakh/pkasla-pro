"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

export default function ModernMinimalTemplate() {
  const [showCoupleQR, setShowCoupleQR] = useState(false);
  // Colors - you can update these
  const accentColor = '#ec4899';
  
  // Fonts - you can update these
  const khmerFont = 'font-preahvihear';
  const moulpaliFont = 'font-moulpali';
  const khangkomuttFont = 'font-khangkomutt';
  
  // Images - UPDATE THESE PATHS with your actual images
  const backgroundImage = '/images/assets/frame/modern-minimal.png'; // Main background
  const decorativeTopLeft = '/images/assets/frame/frame-top-left.png'; // Top left decorative
  const decorativeTopRight = '/images/assets/frame/frame-top-right.png'; // Top right decorative
  const decorativeBottomLeft = '/images/assets/frame/frame-bottom-left.png'; // Bottom left decorative
  const decorativeBottomRight = '/images/assets/frame/frame-bottom-right.png'; // Bottom right decorative
  const decorativeBorder = '/images/assets/frame/frame-bg.png'; // Bottom border
  const galleryImages = [ // Photo gallery images
    '/images/assets/frame/modern-minimal.png',
    '/images/assets/frame/modern-minimal.png',
  ];
  const qrCodeImage = '/images/assets/frame/vintage-lace.png'; // QR code image for location
  const qrCodeCoupleKH = '/images/KHQR-KH.png'; // QR code for couple (Khmer)
  const qrCodeCoupleUS = '/images/KHQR-US.png'; // QR code for couple (English)
  
  // Wedding information - UPDATE THESE
  const groomName = "មន្នី ច័ន្ទផល្គុន";
  const brideName = "ម៉ៃ យូរី";
  const guestName = 'សុវណ្ណ ទេពី'
  const invitationText = "សម្តេច ទ្រង់ ឯកឧត្តម អ្នកឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា ចូលរួមជាអធិបតី និង ជាភ្ញៀវកិត្តិយសដើម្បីប្រសិទ្ធិពរជ័យ សិរីមង្គល";
  const googleMapLink = "https://maps.google.com/";
  
  // Program schedule
  const programSchedule = [
    { time: "វេលាម៉ោង ០៦:០០-០៧:០០ព្រឹក", event: "ជួបជុំភ្ញៀវកិត្តិយស ដើម្បីរៀបចំហែជំនួន" },
    { time: "វេលាម៉ោង ០៧:០០-០៨:០០ព្រឹក", event: "ពិធីហែជំនួន(កំណត់)" },
    { time: "វេលាម៉ោង ០៨:០០-០៩:០០ព្រឹក", event: "ពិធីចៅមហានិយាយជើងការ រាប់ផ្លែឈើ" },
    { time: "វេលាម៉ោង ០៩:០០-១០:០០ព្រឹក", event: "ពិធីកាត់សក់បង្កក់សិរី" },
  ];

  return (
    <section 
      className="overflow-hidden relative py-20 scroll-smooth min-h-screen"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Decorative Elements - UPDATE IMAGE PATHS */}
      {decorativeTopLeft && (
        <motion.div 
          className="absolute top-0 left-0 w-48 h-48 md:w-64 md:h-64 opacity-60 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, x: -20, y: -20 }}
          animate={{ opacity: 0.6, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          style={{
            backgroundImage: `url(${decorativeTopLeft})`,
            backgroundSize: 'contain',
            backgroundPosition: 'top left',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      {decorativeTopRight && (
        <motion.div 
          className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 opacity-60 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, x: 20, y: -20 }}
          animate={{ opacity: 0.6, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          style={{
            backgroundImage: `url(${decorativeTopRight})`,
            backgroundSize: 'contain',
            backgroundPosition: 'top right',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      {decorativeBottomLeft && (
        <motion.div 
          className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 opacity-60 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, x: -20, y: 20 }}
          animate={{ opacity: 0.6, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          style={{
            backgroundImage: `url(${decorativeBottomLeft})`,
            backgroundSize: 'contain',
            backgroundPosition: 'bottom left',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      {decorativeBottomRight && (
        <motion.div 
          className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 opacity-60 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
          animate={{ opacity: 0.6, scale: 1, x: 0, y: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          style={{
            backgroundImage: `url(${decorativeBottomRight})`,
            backgroundSize: 'contain',
            backgroundPosition: 'bottom right',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      {decorativeBorder && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-32 opacity-50 pointer-events-none"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
          style={{
            backgroundImage: `url(${decorativeBorder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'bottom center',
            backgroundRepeat: 'repeat-x',
          }}
        />
      )}

      <div className="container relative z-10 px-4 mx-auto max-w-6xl">
        {/* Hero Section */}
        <motion.div 
          className="mb-16 text-center relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 className={`relative mb-8 text-3xl ${moulpaliFont} md:text-4xl`} style={{ color: accentColor }}>
            សិរីមង្គលអាពាហ៍ពិពាហ៍
          </h2>
          <div className="flex justify-center items-center flex-col gap-4 mb-8">
            <h3 className={`text-2xl md:text-3xl ${khangkomuttFont}`}>
              {groomName}
            </h3>
            <Image src="/images/assets/2hearts.gif" alt="Heart" width={64} height={64} />
            <h3 className={`text-2xl md:text-3xl ${khangkomuttFont}`}>
              {brideName}
            </h3>
          </div>
          
          {/* Invitation Text Card with Frame */}
          <motion.div 
            className="relative p-6 mx-auto max-w-4xl rounded-2xl border-2 border-pink-200 shadow-lg backdrop-blur-sm bg-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            whileInView={{ scale: [1, 1.02, 1] }}
            viewport={{ once: true }}
          >
            <p className={`mb-6 text-xl font-medium text-gray-800 ${khmerFont}`}>
            យើងខ្ញុំមានកត្តិយសសូមគោរពអញ្ជើញ
          </p>
            <p className={`text-lg leading-relaxed text-gray-700 ${khmerFont} relative z-10`}>
              {invitationText} <strong className="text-pink-600">ក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍</strong> កូនប្រុស-កូនស្រី របស់យើងខ្ញុំទាំងពីរ។
            </p>
          </motion.div>
        </motion.div>

        {/* Program Schedule with Frame */}
        <motion.div 
          className="mx-auto max-w-4xl mb-16 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="relative p-8 rounded-2xl border-2 border-pink-200 shadow-lg backdrop-blur-sm bg-white/80">
            <div className="relative z-10">
              <h3 className={`text-2xl md:text-3xl ${moulpaliFont} text-center mb-6`} style={{ color: accentColor }}>
                កម្មវិធីសិរីមង្គល អាពាហ៍ពិពាហ៍
              </h3>
              <div className="space-y-4">
                {programSchedule.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-pink-50/50 border border-pink-100"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-pink-400 mt-2 shrink-0"></div>
            <div>
                      <p className={`font-semibold ${khmerFont} mb-1`} style={{ color: accentColor }}>
                        {item.time}
                      </p>
                      <p className={`text-gray-700 ${khmerFont}`}>
                        {item.event}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Google Map Link with QR Code */}
        {googleMapLink && (
          <motion.div 
            className="mx-auto max-w-4xl mb-16 relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="relative p-8 rounded-2xl border-2 border-pink-200 shadow-lg backdrop-blur-sm bg-white/80">
              <div className="relative z-10">
                <h3 className={`text-2xl md:text-3xl ${moulpaliFont} text-center mb-6`} style={{ color: accentColor }}>
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
                    <div className="relative w-48 h-48 md:w-64 md:h-64 p-4 bg-white rounded-lg border-2 border-pink-200">
                      <Image
                        src={qrCodeImage}
                        alt="QR Code"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className={`text-sm text-gray-600 ${khmerFont}`}>
                      ស្កេនដើម្បីបើកផែនទី
                    </p>
                  </motion.div>
                )}
                
                <motion.a
                  href={googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-lg inline-block underline font-medium ${khmerFont}`}
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
        <motion.div 
          className="mx-auto max-w-4xl mb-16 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="relative p-8 rounded-2xl border-2 border-pink-200 shadow-lg backdrop-blur-sm bg-white/80">
            <div className="relative z-10">
              <h3 className={`text-2xl md:text-3xl ${moulpaliFont} text-center mb-6`} style={{ color: accentColor }}>
                កម្រងរូបភាពអនុស្សាវរីយ៍
              </h3>
              <p className={`text-center mb-6 text-gray-600 ${khmerFont}`}>
                រូបភាពសម្រាប់រំលឹក និងជាចំណងអាពាហ៍ពិពាហ៍ដ៏រឹងមាំ ហើយមានសុភមង្គល សម្រាប់យើងទាំងពីរនាក់។
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {galleryImages.map((img, index) => (
                  <motion.div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-pink-200"
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

        {/* Thank You Letter with Frame */}
        <motion.div 
          className="mx-auto max-w-4xl mb-16 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="relative p-8 rounded-2xl border-2 border-pink-200 shadow-lg backdrop-blur-sm bg-white/80">
            <div className="relative z-10">
              <h3 className={`text-2xl md:text-3xl ${moulpaliFont} text-center mb-6`} style={{ color: accentColor }}>
                លិខិតសូមថ្លែងអំណរគុណ
              </h3>
              <p className={`text-lg leading-relaxed text-gray-700 ${khmerFont}`}>
                ខ្ញុំបាទ នាងខ្ញុំ ជាមាតាបិតា កូនប្រុស-កូនស្រី សូមថ្លែង អំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះវត្តមាន ដ៏ឧត្តុង្គឧត្តម របស់សម្តេច ទ្រង់ ឯកឧត្តម លោកជំទាវ អ្នកឧកញ៉ា ឧកញ៉ា លោកស្រី អ្នកនាង កញ្ញា អញ្ជើញចូលរួមជា ភ្ញៀវកិត្តិយស ក្នុងពិធីសិរីមង្គលអាពាហ៍ពិពាហ៍ កូន ប្រុស-ស្រី របស់យើងខ្ញុំ។ សូមមេត្តាទទួលនូវ សេចក្តី គោរព ដ៏ខ្ពង់ខ្ពស់ពីយើងខ្ញុំ។
              </p>
            </div>
          </div>
        </motion.div>

        {/* Couple QR Code Section */}
        <motion.div 
          className="mx-auto max-w-4xl mb-16 relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="relative p-8 rounded-2xl border-2 border-pink-200 shadow-lg backdrop-blur-sm bg-white/80">
            <div className="relative z-10">
              <div className="flex flex-col items-center gap-6">
                {/* Clickable button */}
                <motion.button
                  onClick={() => setShowCoupleQR(!showCoupleQR)}
                  className={`px-8 py-4 rounded-lg border-2 font-medium ${khmerFont} flex items-center gap-3`}
                  style={{ 
                    color: showCoupleQR ? 'white' : accentColor,
                    borderColor: accentColor,
                    backgroundColor: showCoupleQR ? accentColor : 'transparent',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{showCoupleQR ? '✕' : '💑'}</span>
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
                          <div className="relative w-48 h-48 md:w-64 md:h-64 p-4 bg-white rounded-lg border-2 border-pink-200">
                            <Image
                              src={qrCodeCoupleKH}
                              alt="QR Code Khmer"
                              fill
                              className="object-contain"
                            />
          </div>
                          <p className={`text-sm font-medium ${khmerFont}`} style={{ color: accentColor }}>
                          ស្កេនដើម្បី​ចូលរួម​ចំណងដៃ
                          </p>
        </div>
                      )}
                      
                      {/* English/US QR Code */}
                      {qrCodeCoupleUS && (
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative w-48 h-48 md:w-64 md:h-64 p-4 bg-white rounded-lg border-2 border-pink-200">
                            <Image
                              src={qrCodeCoupleUS}
                              alt="QR Code English"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <p className={`text-sm font-medium ${khmerFont}`} style={{ color: accentColor }}>
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
      </div>
    </section>
  );
}
