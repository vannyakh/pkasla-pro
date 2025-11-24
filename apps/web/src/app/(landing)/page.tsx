'use client'

import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { 
  Heart, 
  Sparkles, 
  Camera, 
  Palette, 
  Globe, 
  Users, 
  CheckCircle2,
  Star,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram
} from 'lucide-react'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
}

function Landing() {
  const heroRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const pricingRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Smooth scroll for navigation links
    const handleSmoothScroll = (e: Event) => {
      const target = e.target as HTMLAnchorElement
      if (target.hash) {
        e.preventDefault()
        const element = document.querySelector(target.hash)
        if (element) {
          gsap.to(window, {
            duration: 1.5,
            scrollTo: {
              y: element,
              offsetY: 80
            },
            ease: 'power3.inOut'
          })
        }
      }
    }

    const navLinks = document.querySelectorAll('a[href^="#"]')
    navLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll)
    })

    // Navbar animation on scroll
    if (navRef.current) {
      gsap.fromTo(navRef.current, 
        { y: -100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: 'power3.out' 
        }
      )

      ScrollTrigger.create({
        trigger: navRef.current,
        start: 'top top',
        end: 'bottom top',
        onEnter: () => {
          gsap.to(navRef.current, {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            duration: 0.3
          })
        },
        onLeaveBack: () => {
          gsap.to(navRef.current, {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            boxShadow: 'none',
            duration: 0.3
          })
        }
      })
    }

    // Hero section animations
    if (heroRef.current) {
      const heroElements = heroRef.current.children
      const badge = heroElements[0] as HTMLElement
      const title = heroElements[1] as HTMLElement
      const subtitle = heroElements[2] as HTMLElement
      const buttons = heroElements[3] as HTMLElement

      gsap.fromTo(badge, 
        { y: 30, opacity: 0, scale: 0.9 },
        { 
          y: 0, 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          ease: 'back.out(1.7)',
          delay: 0.2
        }
      )

      gsap.fromTo(title, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          ease: 'power3.out',
          delay: 0.4
        }
      )

      gsap.fromTo(subtitle, 
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: 'power2.out',
          delay: 0.6
        }
      )

      gsap.fromTo(buttons, 
        { y: 30, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: 'power2.out',
          delay: 0.8
        }
      )

      // Floating animation for hero badge
      gsap.to(badge, {
        y: -10,
        duration: 2,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true
      })
    }

    // Features section animations
    if (featuresRef.current) {
      const sectionTitle = featuresRef.current.querySelector('h2')
      const sectionSubtitle = featuresRef.current.querySelector('p')
      const featureCards = featuresRef.current.querySelectorAll('.feature-card')

      gsap.fromTo([sectionTitle, sectionSubtitle],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      gsap.fromTo(featureCards,
        { 
          y: 60, 
          opacity: 0, 
          scale: 0.9,
          rotationX: 15
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 0.8,
          ease: 'power3.out',
          stagger: {
            amount: 0.6,
            from: 'start'
          },
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Hover animations for feature cards
      featureCards.forEach((card) => {
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            scale: 1.02,
            duration: 0.3,
            ease: 'power2.out'
          })
        })
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          })
        })
      })
    }

    // Gallery section animations
    if (galleryRef.current) {
      const galleryTitle = galleryRef.current.querySelector('h2')
      const gallerySubtitle = galleryRef.current.querySelector('p')
      const galleryItems = galleryRef.current.querySelectorAll('.gallery-item')

      gsap.fromTo([galleryTitle, gallerySubtitle],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: galleryRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      gsap.fromTo(galleryItems,
        { 
          y: 80, 
          opacity: 0, 
          scale: 0.8,
          rotation: 5
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'back.out(1.2)',
          stagger: {
            amount: 0.8,
            from: 'random'
          },
          scrollTrigger: {
            trigger: galleryRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }

    // Pricing section animations
    if (pricingRef.current) {
      const pricingTitle = pricingRef.current.querySelector('h2')
      const pricingSubtitle = pricingRef.current.querySelector('p')
      const pricingCards = pricingRef.current.querySelectorAll('.pricing-card')

      gsap.fromTo([pricingTitle, pricingSubtitle],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: pricingRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      gsap.fromTo(pricingCards,
        { 
          y: 60, 
          opacity: 0, 
          scale: 0.95
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: {
            amount: 0.4,
            from: 'center'
          },
          scrollTrigger: {
            trigger: pricingRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Highlight popular card
      const popularCard = pricingCards[1]
      if (popularCard) {
        gsap.to(popularCard, {
          y: -5,
          duration: 2,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true,
          scrollTrigger: {
            trigger: popularCard,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        })
      }
    }

    // Testimonials section animations
    if (testimonialsRef.current) {
      const testimonialsTitle = testimonialsRef.current.querySelector('h2')
      const testimonialsSubtitle = testimonialsRef.current.querySelector('p')
      const testimonialCards = testimonialsRef.current.querySelectorAll('.testimonial-card')

      gsap.fromTo([testimonialsTitle, testimonialsSubtitle],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      gsap.fromTo(testimonialCards,
        { 
          x: -50, 
          opacity: 0, 
          scale: 0.9
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          stagger: {
            amount: 0.5,
            from: 'start'
          },
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }

    // CTA section animations
    if (ctaRef.current) {
      const ctaContent = ctaRef.current.children[0] as HTMLElement
      
      gsap.fromTo(ctaContent,
        { 
          y: 50, 
          opacity: 0, 
          scale: 0.95
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      )

      // Parallax effect for CTA background
      gsap.to(ctaRef.current, {
        backgroundPosition: '50% 100%',
        ease: 'none',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    }

    // Footer animation
    if (footerRef.current) {
      gsap.fromTo(footerRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }

    // Smooth scroll behavior
    gsap.config({ nullTargetWarn: false })

    return () => {
      navLinks.forEach(link => {
        link.removeEventListener('click', handleSmoothScroll)
      })
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-amber-50">
      {/* Navigation */}
      <nav ref={navRef} className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
              <span className="text-xl font-bold text-gray-900">Pkasla</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-rose-600 transition">Features</a>
              <a href="#gallery" className="text-gray-700 hover:text-rose-600 transition">Gallery</a>
              <a href="#pricing" className="text-gray-700 hover:text-rose-600 transition">Pricing</a>
              <a href="#contact" className="text-gray-700 hover:text-rose-600 transition">Contact</a>
            </div>
            <button className="bg-rose-500 text-white px-6 py-2 rounded-full hover:bg-rose-600 transition shadow-lg hover:shadow-xl">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div ref={heroRef} className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Premium Wedding Invitations</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Create Beautiful
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">
                Cambodian Wedding Invitations
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Celebrate your special day with elegant, customizable digital invitations 
              that honor Cambodian traditions and modern design
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-rose-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-rose-600 transition shadow-lg hover:shadow-xl flex items-center space-x-2">
                <span>Start Creating</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="border-2 border-rose-500 text-rose-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-rose-50 transition">
                View Gallery
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div ref={featuresRef} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Pkasla?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to create stunning wedding invitations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 hover:shadow-xl transition cursor-pointer">
              <div className="bg-rose-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Palette className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Beautiful Designs</h3>
              <p className="text-gray-600">
                Choose from hundreds of professionally designed templates inspired by Cambodian culture and modern aesthetics
              </p>
            </div>
            <div className="feature-card p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 hover:shadow-xl transition cursor-pointer">
              <div className="bg-amber-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Camera className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Easy Customization</h3>
              <p className="text-gray-600">
                Personalize every detail - colors, fonts, photos, and text to match your unique wedding style
              </p>
            </div>
            <div className="feature-card p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 hover:shadow-xl transition cursor-pointer">
              <div className="bg-rose-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Globe className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Digital & Print</h3>
              <p className="text-gray-600">
                Share digitally with guests worldwide or order high-quality printed invitations delivered to your door
              </p>
            </div>
            <div className="feature-card p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 hover:shadow-xl transition cursor-pointer">
              <div className="bg-amber-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Guest Management</h3>
              <p className="text-gray-600">
                Track RSVPs, manage your guest list, and send reminders all in one place
              </p>
            </div>
            <div className="feature-card p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 hover:shadow-xl transition cursor-pointer">
              <div className="bg-rose-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cultural Elements</h3>
              <p className="text-gray-600">
                Incorporate traditional Cambodian motifs, colors, and symbols into your invitations
              </p>
            </div>
            <div className="feature-card p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 hover:shadow-xl transition cursor-pointer">
              <div className="bg-amber-500 w-14 h-14 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">24/7 Support</h3>
              <p className="text-gray-600">
                Get help whenever you need it from our dedicated support team
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-rose-50">
        <div ref={galleryRef} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Inspiration Gallery
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our collection of beautiful invitation designs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="gallery-item group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 aspect-[3/4] hover:scale-105 transition duration-300 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg mb-2">Design Template {item}</h3>
                    <p className="text-white/90 text-sm">Elegant & Modern</p>
                  </div>
                </div>
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <Heart className="h-16 w-16 text-rose-400 mx-auto mb-4" />
                    <div className="h-2 w-24 bg-rose-300 rounded-full mx-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div ref={pricingRef} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for your special day
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="pricing-card p-8 rounded-2xl border-2 border-gray-200 hover:border-rose-300 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">$29</span>
                <span className="text-gray-600">/event</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">5 Design Templates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Digital Invitations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Up to 100 Guests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">RSVP Tracking</span>
                </li>
              </ul>
              <button className="w-full border-2 border-rose-500 text-rose-500 py-3 rounded-full font-semibold hover:bg-rose-50 transition">
                Get Started
              </button>
            </div>
            <div className="pricing-card p-8 rounded-2xl border-2 border-rose-500 bg-gradient-to-br from-rose-50 to-amber-50 relative hover:shadow-xl transition">
              <div className="absolute top-0 right-0 bg-rose-500 text-white px-4 py-1 rounded-bl-2xl rounded-tr-2xl text-sm font-semibold">
                Popular
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">$59</span>
                <span className="text-gray-600">/event</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Unlimited Templates</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Digital + Print Options</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Unlimited Guests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Advanced Customization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Priority Support</span>
                </li>
              </ul>
              <button className="w-full bg-rose-500 text-white py-3 rounded-full font-semibold hover:bg-rose-600 transition shadow-lg">
                Get Started
              </button>
            </div>
            <div className="pricing-card p-8 rounded-2xl border-2 border-gray-200 hover:border-rose-300 transition">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">Custom</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Everything in Premium</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Custom Design Service</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">Dedicated Account Manager</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-rose-500" />
                  <span className="text-gray-600">White-label Options</span>
                </li>
              </ul>
              <button className="w-full border-2 border-rose-500 text-rose-500 py-3 rounded-full font-semibold hover:bg-rose-50 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-rose-50 to-white">
        <div ref={testimonialsRef} className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join hundreds of happy couples who chose Pkasla
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sopheap & Ratha", location: "Phnom Penh", text: "The invitations were absolutely stunning! Our guests couldn't stop complimenting the beautiful design." },
              { name: "Sokun & Srey", location: "Siem Reap", text: "Easy to use and the customization options were perfect. Made our wedding planning so much easier!" },
              { name: "Vannak & Sreyneang", location: "Battambang", text: "The cultural elements really made our invitations special. Highly recommend Pkasla!" }
            ].map((testimonial, idx) => (
              <div key={idx} className="testimonial-card p-8 bg-white rounded-2xl shadow-lg border border-rose-100">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-rose-500 to-amber-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Create Your Perfect Invitation?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Start designing your dream wedding invitation today. It only takes a few minutes!
          </p>
          <button className="bg-white text-rose-500 px-8 py-4 rounded-full text-lg font-semibold hover:bg-rose-50 transition shadow-xl hover:shadow-2xl flex items-center space-x-2 mx-auto">
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} id="contact" className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
                <span className="text-xl font-bold">Pkasla</span>
              </div>
              <p className="text-gray-400">
                Creating beautiful wedding invitations for your special day
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Templates</a></li>
                <li><a href="#" className="hover:text-white transition">Gallery</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>info@pkasla.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+855 12 345 678</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Phnom Penh, Cambodia</span>
                </li>
              </ul>
              <div className="flex items-center space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pkasla. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
