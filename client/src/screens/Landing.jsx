import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-primary flex flex-col selection:bg-surface-200">

      {/* Cinematic Background Video */}
      <div className="absolute inset-0 z-0 bg-black">
        <video
          className="w-full h-full object-cover object-center"
          autoPlay muted loop playsInline preload="auto"
          poster="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_132328_5f9029c8-218f-4489-82b6-29ff2849920e.png"
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/55"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 h-20 flex items-center justify-between px-8 border-b border-white/10">
        <h1 className="font-sora font-semibold text-lg tracking-widest text-white">DAYFLOW</h1>
        <div className="flex gap-6">
          <Link to="/login" className="text-sm font-mono text-white/70 hover:text-white transition-colors flex items-center">
            SIGN IN
          </Link>
          <Link to="/login" className="px-6 py-2 border border-white/50 text-sm font-mono text-white hover:bg-white hover:text-black transition-colors">
            ENTER DAYFLOW
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center max-w-4xl"
        >
          <h2 className="font-sora text-6xl md:text-8xl font-light tracking-tight leading-tight mb-8 text-white">
            Every workday,<br />
            <span className="text-white/60">perfectly aligned.</span>
          </h2>
          <p className="font-mono text-white/70 text-sm md:text-base max-w-2xl mx-auto mb-12 leading-relaxed">
            A modern HR platform connecting people, attendance, leave, payroll and workforce operations in one cinematic flow.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Link to="/login" className="px-8 py-3 border border-white bg-white text-black text-sm font-mono hover:bg-transparent hover:text-white transition-colors">
              ENTER DAYFLOW
            </Link>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 border border-white/30 text-white text-sm font-mono hover:border-white hover:bg-white/10 transition-colors"
            >
              EXPLORE PLATFORM
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
