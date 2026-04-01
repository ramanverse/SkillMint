import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight, Briefcase, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'BUYER' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-mint-dark via-mint to-[#00E59D] p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i + 1) * 150}px`, height: `${(i + 1) * 150}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Zap size={20} className="text-white fill-current" />
            </div>
            <span className="font-display font-extrabold text-2xl text-white tracking-tight">Skill<span className="text-white/80">Mint</span></span>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h2 className="font-display font-extrabold text-5xl text-white leading-[1.1] mb-6 tracking-tighter">
            Join the<br />elite network.
          </h2>
          <p className="text-white/90 text-xl font-medium leading-relaxed">
            Connect with top-tier student talent and turn your skills into a premium brand.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-mint rounded-xl flex items-center justify-center shadow-lg shadow-mint/20">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-gray-900">Skill<span className="text-mint">Mint</span></span>
          </div>

          <h1 className="font-display font-extrabold text-4xl text-gray-900 mb-2 tracking-tight">Get started</h1>
          <p className="text-gray-500 mb-8 font-medium">Create your SkillMint profile in seconds.</p>

          {/* Role Toggle */}
          <div className="flex gap-4 mb-8">
            {[
              { value: 'BUYER', label: "I'm Hiring", icon: ShoppingBag },
              { value: 'SELLER', label: "I'm Freelancing", icon: Briefcase },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: value }))}
                className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 text-sm font-bold transition-all duration-300 ${
                  form.role === value
                    ? 'border-mint bg-mint-light/50 text-mint shadow-xl shadow-mint/5 scale-105'
                    : 'border-gray-100 bg-white text-gray-400 hover:border-mint/20'
                }`}
              >
                <Icon size={20} className={form.role === value ? 'text-mint' : 'text-gray-300'} />
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="signup-name" name="name" type="text" autoComplete="name" required value={form.name} onChange={handleChange}
                  placeholder="Jane Smith" className="input-mint pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="signup-email" name="email" type="email" autoComplete="username" required value={form.email} onChange={handleChange}
                  placeholder="you@university.edu" className="input-mint pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="signup-password" name="password" type={showPw ? 'text' : 'password'} autoComplete="new-password" required
                  value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className="input-mint pl-10 pr-10" />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button id="signup-submit" type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-2xl shadow-mint/20 mt-8">
              {loading
                ? <div className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin" />
                : <> Create Account <ArrowRight size={18} /></>
              }
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-mint font-medium hover:text-mint-dark">Sign in →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
