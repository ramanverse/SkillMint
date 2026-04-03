import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Star, Shield, Zap as ZapIcon, Users, Rocket, Sparkles, Layout, Code, Search } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export default function Landing() {
  return (
    <div className="bg-[#F8FEFB] dark:bg-obsidian-950 overflow-x-hidden min-h-screen selection:bg-mint selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-48 lg:pb-32 flex items-center justify-center overflow-hidden">
        {/* Background Glows */}
        <div className="bg-glow w-[500px] h-[500px] bg-mint/5 dark:bg-mint/10 -top-20 -left-20 blur-[100px]" />
        <div className="bg-glow w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 -bottom-20 -right-20 blur-[120px]" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >

            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-8xl font-display font-extrabold text-gray-900 dark:text-white leading-[1.1] lg:leading-[1.05] tracking-tight mb-6 lg:mb-8">
              Elevate your <span className="text-mint">academic</span> hustle.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10 lg:mb-12">
              Transform your university skills into a professional brand. The premier marketplace built for modern student creators and ambitious businesses.
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center justify-center">
              <Link to="/signup" className="btn-primary py-4 px-8 lg:py-5 lg:px-12 text-lg lg:text-xl flex items-center gap-3 group shadow-2xl shadow-mint/20 hover:-translate-y-1 transition-all duration-300">
                <span>Start Your Journey</span>
                <Rocket size={22} className="group-hover:-translate-y-1 transition-transform" />
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="how-it-works" className="pt-24 lg:pt-32 pb-12 lg:pb-16 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
            <h2 className="text-3xl lg:text-5xl font-display font-extrabold text-gray-900 dark:text-white mb-6">Designed for the <span className="text-mint">Creative Elite</span></h2>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-medium">Everything you need to showcase, manage, and scale your freelance empire while studying.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Row 1 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 bento-tile group flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-mint/10 dark:bg-mint/20 rounded-2xl flex items-center justify-center text-mint mb-8">
                  <Layout size={32} />
                </div>
                <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Spatial Portfolio</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-lg">
                  Present your work in a high-fidelity gallery that features spatial depth and interactive previews. Leave static PDFs behind.
                </p>
              </div>
              <div className="mt-12 h-40 bg-gradient-to-br from-mint/20 to-emerald-500/10 dark:from-mint/10 dark:to-obsidian-900 rounded-2xl border border-mint/20 flex items-center justify-center overflow-hidden">
                 <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl shadow-lg" />
                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl shadow-lg translate-y-4" />
                    <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-xl shadow-lg translate-y-2" />
                 </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bento-tile group bento-tile-accent flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
                  <Shield size={32} />
                </div>
                <h3 className="text-3xl font-display font-bold mb-4">Secure Flow</h3>
                <p className="text-lg text-white/80 font-medium leading-relaxed">
                  Smart escrows and verified student IDs ensure you always get paid for your talent.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                 <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 animate-pulse">
                    <Zap size={40} className="text-white fill-current" />
                 </div>
              </div>
            </motion.div>

            {/* Row 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="bento-tile group"
            >
               <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-8">
                <Code size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">API Driven</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Deep integration with top student tools and seamless payment gateways.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-2 bento-tile group flex flex-col md:flex-row items-center gap-10"
            >
              <div className="flex-1">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mb-8">
                  <Search size={32} />
                </div>
                <h3 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-4">Omni Search</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
                  Advanced AI-powered discovery helps buyers find the exact skill they need in seconds.
                </p>
              </div>
              <div className="w-full md:w-64 h-48 bg-gray-100 dark:bg-white/[0.03] rounded-3xl overflow-hidden relative border border-gray-200 dark:border-white/10">
                 <div className="absolute top-4 left-4 right-4 bg-white dark:bg-obsidian-900 py-3 px-4 rounded-xl shadow-lg flex items-center gap-3">
                    <Search size={14} className="text-mint" />
                    <div className="w-20 h-2 bg-gray-200 dark:bg-white/20 rounded-full" />
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="pt-12 lg:pt-16 pb-20 lg:pb-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { num: 'Verified', label: 'Top Student Talent' },
              { num: '₹₹₹', label: 'Premium Student Earnings' },
              { num: 'Global', label: 'Marketplace Impact' },
              { num: '1-to-1', label: 'Direct Communication' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl lg:text-6xl font-display font-extrabold text-gray-900 dark:text-white mb-2 tracking-tighter">
                  {stat.num}
                </div>
                <div className="text-sm font-bold text-mint uppercase tracking-widest">
                   {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="pb-24 lg:pb-32">
        <div className="container mx-auto px-6">
          <div className="liquid-glass rounded-[2rem] lg:rounded-[3rem] p-8 sm:p-12 lg:p-24 relative overflow-hidden text-center group">
             {/* Animated Background Gradients */}
             <div className="absolute inset-0 bg-gradient-to-br from-mint/10 via-transparent to-purple-500/5 dark:from-mint/5 dark:to-obsidian-950 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
             
             <div className="relative z-10 max-w-3xl mx-auto">
               <h2 className="text-3xl lg:text-7xl font-display font-extrabold text-gray-900 dark:text-white mb-6 lg:mb-8 tracking-tighter leading-tight lg:leading-none">
                 Ready to <span className="text-mint">Mint</span> your career?
               </h2>
               <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 font-medium mb-10 lg:mb-12 max-w-xl mx-auto">
                 Join the world's most talented student community. It takes less than 60 seconds to set up your professional space.
               </p>
               <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Link to="/signup" className="btn-primary py-5 px-12 text-xl w-full sm:w-auto shadow-2xl">
                    Create Your Profile
                 </Link>
                 <Link to="/marketplace" className="nav-link font-bold text-lg p-4 group flex items-center gap-2">
                    Browse the Marketplace
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
               </div>
             </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
