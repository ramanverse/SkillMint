import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Globe, Mail, ArrowRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'For Students',
      links: [
        { name: 'Discover Gigs', path: '/marketplace' },
        { name: 'How it Works', path: '#how-it-works' },
        { name: 'Post a Skill', path: '/signup' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '#' },
        { name: 'Careers', path: '#' },
        { name: 'Press', path: '#' },
        { name: 'Support', path: '/support' },
      ]
    },
    {
      title: 'Platform',
      links: [
        { name: 'Terms of Service', path: '#' },
        { name: 'Privacy Policy', path: '#' },
        { name: 'Trust & Safety', path: '#' },
        { name: 'Sitemap', path: '#' },
      ]
    }
  ];

  return (
    <footer className="bg-transparent border-t border-gray-100 dark:border-white/5 pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-12 mb-24">
          
          {/* Brand Identity */}
          <div className="lg:col-span-2 max-w-sm">
            <Link to="/" className="flex items-center gap-2 mb-8 group">
              <div className="w-10 h-10 bg-mint rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap size={22} className="text-white fill-current" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tighter text-gray-900 dark:text-white">
                Skill<span className="text-mint">Mint</span>
              </span>
            </Link>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mb-10 leading-relaxed">
              The world's premier student freelance marketplace. Turn your unique skills into a professional career while you learn.
            </p>
            <div className="flex items-center gap-6">
              {[Zap, Globe, Mail].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 hover:text-mint dark:hover:text-mint transition-all hover:-translate-y-1"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          
          {sections.map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h4 className="text-sm font-bold uppercase tracking-widest text-mint mb-10">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-6">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="nav-link text-lg font-medium">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="lg:col-span-4">
             <div className="liquid-glass p-8 rounded-3xl border-transparent dark:border-white/5">
                <h4 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-4">Stay in the loop</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">Get the latest student success stories and skill insights.</p>
                <div className="relative group">
                   <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input 
                    type="email" 
                    placeholder="you@university.edu" 
                    className="input-mint text-sm pl-10 pr-4 py-3 placeholder:text-gray-400"
                   />
                   <button className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-mint text-white rounded-lg hover:bg-mint-dark transition-colors">
                      <ArrowRight size={14} />
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <p className="text-gray-400 font-medium">
             © {currentYear} SkillMint Inc. Built for the next generation of creators.
          </p>
          <div className="flex items-center gap-8">
             {['Status', 'Sitemap', 'Cookie Policy'].map(item => (
                <a key={item} href="#" className="text-gray-400 hover:text-mint text-sm font-medium transition-colors">
                   {item}
                </a>
             ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
