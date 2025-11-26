'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { Header, Footer, Hero } from '@/components/landings/index'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
}

function Landing() {
  

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-1">
        <Hero />
      </main>
      <Footer />
    </div>
  )
}

export default Landing
