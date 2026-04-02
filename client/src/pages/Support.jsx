import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle, Mail, FileText, ChevronRight, Zap, ExternalLink, ShieldCheck } from 'lucide-react';

const FAQS = [
  { q: 'How do I withdraw my earnings?', a: 'You can withdraw your earnings via UPI or Bank Transfer once the order is marked as completed and the 7-day clearing period has passed.' },
  { q: 'What are the service fees?', a: 'SkillMint charges a flat 10% service fee for sellers. There are no hidden charges for buyers.' },
  { q: 'Is my academic data safe?', a: 'Yes, all communications and files are encrypted. We do not share your university ID or personal data.' },
];

export default function Support() {
  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="grid lg:grid-cols-2 gap-8 items-center">
         <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
         >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-[10px] font-bold uppercase tracking-widest mb-4">
               <ShieldCheck size={12} className="fill-current" />
               <span>Trust & Safety</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-gray-900 dark:text-white tracking-tighter leading-none mb-6">
              SkillMint <span className="text-mint">Help Center</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-md">
              Find answers to common questions or reach out to our dedicated student support team.
            </p>
         </motion.div>

         <div className="grid grid-cols-2 gap-4">
            {[
              { icon: MessageCircle, label: 'Live Chat', desc: 'Average response: 5m' },
              { icon: Mail, label: 'Email Support', desc: '24 hour guarantee' },
            ].map(item => (
              <div key={item.label} className="bento-tile p-6 hover:border-mint/30 transition-all cursor-pointer group">
                 <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-mint mb-4 group-hover:scale-110 transition-transform">
                    <item.icon size={20} />
                 </div>
                 <p className="font-bold text-gray-900 dark:text-white text-sm">{item.label}</p>
                 <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-widest">{item.desc}</p>
              </div>
            ))}
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* FAQ Section */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
               {FAQS.map(faq => (
                 <div key={faq.q} className="p-6 rounded-3xl bg-white/40 dark:bg-white/5 border border-gray-100 dark:border-white/5 group hover:border-mint/20 transition-all">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                       <Zap size={14} className="text-mint" />
                       {faq.q}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{faq.a}</p>
                 </div>
               ))}
            </div>
         </div>

         {/* Sidebar Resources */}
         <div className="space-y-6">
            <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white mb-6">Resources</h2>
            <div className="space-y-3">
               {[
                 { icon: FileText, label: 'Terms of Service', path: '#' },
                 { icon: FileText, label: 'Privacy Policy', path: '#' },
                 { icon: HelpCircle, label: 'Dispute Resolution', path: '#' },
               ].map(resource => (
                 <button key={resource.label} className="w-full flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-mint/5 hover:text-mint transition-all text-sm font-bold text-gray-500 group">
                    <div className="flex items-center gap-3">
                       <resource.icon size={18} className="text-gray-400 group-hover:text-mint" />
                       <span>{resource.label}</span>
                    </div>
                    <ExternalLink size={14} className="opacity-40" />
                 </button>
               ))}
            </div>
            
            <div className="liquid-glass p-8 rounded-[2rem] text-center mt-12 bg-gradient-to-br from-mint/10 to-transparent">
               <h3 className="text-xl font-display font-extrabold text-gray-900 dark:text-white mb-2">Join Community</h3>
               <p className="text-xs text-gray-500 mb-6">Connect with fellow student entrepreneurs on our Discord.</p>
               <button className="btn-primary py-3 px-8 w-full text-sm">Join Server</button>
            </div>
         </div>
      </div>
    </div>
  );
}
