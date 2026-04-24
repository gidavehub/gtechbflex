'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Rocket, Lightbulb, TrendingUp,
  Zap, Award, Clock, Home, ChevronRight, Menu, X,
} from 'lucide-react';

// ==========================================
// PROGRAM DATA
// ==========================================
const PROGRAMS = [
  {
    id: 'seedstars',
    name: 'SeedStars',
    tagline: 'Pre-Incubation Program',
    duration: '3 – 6 weeks',
    icon: Lightbulb,
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    borderLight: 'border-violet-200',
    textLight: 'text-violet-700',
    description:
      'Our pre-incubation program based on mentorship and designed to prepare entrepreneurs in the start-up phase for a successful start-up development.',
    details: [
      'Provides a structured environment where participants can refine their business ideas through guided market research and customer validation',
      'Emphasizes changes in mindset by promoting resilience, adaptability and entrepreneurial confidence',
      'Participants acquire essential entrepreneurial skills such as business modeling, lean startup methodologies, financial education and pitching',
      'Offers workshops, networking opportunities and access to industry experts to support the refinement of ideas, skills development and market understanding',
      'Lays a solid foundation for further incubation and scaling',
    ],
  },
  {
    id: 'startup-edge',
    name: 'Startup Edge',
    tagline: 'Incubation Program',
    duration: '6 – 12 months',
    icon: Rocket,
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    borderLight: 'border-blue-200',
    textLight: 'text-blue-700',
    description:
      'Our incubation program through which SMEs and startups can apply to be supported in their concrete implementation phases of their companies.',
    details: [
      'Entrepreneurs have access to tailored training on entrepreneurship, financial management, business management, human resources management, communication and psycho-social support for sustainable stability',
      'Structured support through product development, customer validation and business model optimization',
      'Includes mentorship, access to resources such as innovation labs and funding',
      'Focuses on building a scalable business, developing a strong team and preparing for investors',
      'Guides entrepreneurs towards market entry and growth',
      '6 months without continuous mentoring, 12 months with continuous mentoring',
    ],
  },
  {
    id: 'scaleup',
    name: 'ScaleUP',
    tagline: 'Acceleration Program',
    duration: '3 weeks – 3 months',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    textLight: 'text-emerald-700',
    description:
      'Our service designed to accelerate the growth of startups by strengthening business operations, expanding market reach and demonstrating attractiveness.',
    details: [
      'Offers advanced mentoring, strategic planning and access to funding opportunities',
      'Participants focus on improving their value proposition, creating investor-ready pitches and establishing scalable processes',
      'Aims to position startups to attract investment, enter into partnerships and prepare for major expansion efforts',
    ],
  },
  {
    id: 'z-accelerate',
    name: 'Z-Accelerate',
    tagline: 'Acceleration Program',
    duration: '3 – 6 months',
    icon: Zap,
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    textLight: 'text-rose-700',
    description:
      'Our acceleration program for startups in the Gambia Tech network focusing on rapid growth, investor connections and market expansion.',
    details: [
      'Offers intensive mentorship, preparation of investor presentations and networking opportunities with local and international investors',
      'Provides support for export readiness, including market research, partnerships and compliance',
      'Aims to help startups secure funding, build strategic relationships with investors and expand their reach beyond national borders',
      'Duration depends on the funds to be raised and the targeted export areas',
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ==========================================
// MAIN PAGE
// ==========================================
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* ===== Navigation ===== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.webp" alt="Gambia Tech" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-bold text-gray-900">Gambia Tech</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
            >
              <Home size={15} /> Home
            </Link>
            <Link
              href="/apply"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-gold-500 text-white hover:bg-gold-600 transition-all shadow-sm hover:shadow-md"
            >
              Call For Applications <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="sm:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="px-4 py-4 space-y-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Home size={16} /> Home
                </Link>
                <Link
                  href="/apply"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold bg-gold-500 text-white hover:bg-gold-600 transition-all shadow-sm"
                >
                  Call For Applications <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ===== Hero Section with Background Image ===== */}
      <section className="relative overflow-hidden min-h-[520px] sm:min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-400/8 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="px-3 py-1.5 rounded-full bg-gold-400/15 text-gold-400 text-[11px] font-bold uppercase tracking-wider border border-gold-400/20 backdrop-blur-sm">
                Empowering Entrepreneurs
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-6"
            >
              Building The Next Generation of{' '}
              <span className="text-gold-gradient">African Entrepreneurs</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base sm:text-lg text-gray-300 leading-relaxed mb-8 max-w-2xl"
            >
              Gambia Tech provides world-class incubation, acceleration, and mentorship programs
              designed to transform innovative ideas into thriving businesses across West Africa.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-gold-500 text-white hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40"
              >
                Become a Member <ArrowRight size={16} />
              </Link>
              <a
                href="#programs"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-white/80 border border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                View Programs <ChevronRight size={16} />
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6 sm:gap-10 mt-12 pt-8 border-t border-white/10"
            >
              {[
                { value: '4', label: 'Programs' },
                { value: '100+', label: 'Entrepreneurs' },
                { value: '9', label: 'Countries' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-black text-gold-400">{stat.value}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Programs Section ===== */}
      <section id="programs" className="py-16 sm:py-24 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-block px-3 py-1.5 rounded-full bg-gold-50 text-gold-600 text-[11px] font-bold uppercase tracking-wider border border-gold-200 mb-4"
            >
              Our Programs
            </motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">
              Programs Designed For Growth
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
              From ideation to international expansion — we have a program for every stage of your entrepreneurial journey.
            </motion.p>
          </motion.div>

          <div className="space-y-8">
            {PROGRAMS.map((program, idx) => {
              const Icon = program.icon;
              return (
                <motion.div
                  key={program.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={fadeUp}
                  custom={idx}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-500"
                >
                  {/* Color accent bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${program.gradient}`} />

                  <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${program.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                        <Icon size={26} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-xl font-black text-gray-900">{program.name}</h3>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${program.bgLight} ${program.textLight} ${program.borderLight} border`}>
                            {program.tagline}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                          <Clock size={12} />
                          <span>Duration: {program.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 leading-relaxed mb-5">
                      {program.description}
                    </p>

                    {/* Details */}
                    <div className="bg-gray-50 rounded-2xl p-5">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">What You Get</h4>
                      <ul className="space-y-2.5">
                        {program.details.map((detail, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-3 text-sm text-gray-600">
                            <div className={`w-5 h-5 rounded-lg ${program.bgLight} ${program.textLight} flex items-center justify-center shrink-0 mt-0.5`}>
                              <ChevronRight size={11} />
                            </div>
                            <span className="leading-relaxed">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 sm:p-12 text-center"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

            <div className="relative z-10 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gold-400/15 flex items-center justify-center mx-auto mb-6">
                <Award size={28} className="text-gold-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Ready to Start Your Journey?
              </h2>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                Join the Gambia Tech network and gain access to mentorship, training, funding opportunities, and a community of ambitious entrepreneurs.
              </p>
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold bg-gold-500 text-white hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40"
              >
                Apply Now <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Image src="/logo.webp" alt="Gambia Tech" width={24} height={24} className="rounded-lg" />
              <span className="text-sm font-bold text-gray-900">
                B-<span className="text-gold-gradient">Flex</span>
              </span>
              <span className="text-xs text-gray-400">by Gambia Tech</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
              <Link href="/apply" className="hover:text-gray-600 transition-colors">Apply</Link>
            </div>
            <p className="text-[11px] text-gray-400">
              © {new Date().getFullYear()} Gambia Tech. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
