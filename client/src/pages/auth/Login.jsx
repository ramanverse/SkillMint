import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
            Elevate your<br />academic hustle.
          </h2>
          <p className="text-white/90 text-xl font-medium leading-relaxed">
            The premium student-powered marketplace built for ambitious creators and business owners.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[['2.4K+', 'Active Learners'], ['850+', 'Expert Gigs'], ['99%', 'Success Rate']].map(([num, label]) => (
              <div key={label} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-center shadow-lg">
                <div className="font-display font-extrabold text-2xl text-white tracking-tight">{num}</div>
                <div className="text-white/60 text-[10px] uppercase font-bold tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </div>
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

          <h1 className="font-display font-extrabold text-4xl text-gray-900 mb-2 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mb-10 font-medium">Continue your professional journey on SkillMint.</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-email"
                  name="email" type="email" autoComplete="username" required
                  value={form.email} onChange={handleChange}
                  placeholder="you@university.edu"
                  className="input-mint pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="login-password"
                  name="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required
                  value={form.password} onChange={handleChange}
                  placeholder="••••••••"
                  className="input-mint pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-2xl shadow-mint/20 mt-8"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-mint font-medium hover:text-mint-dark">Create one →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
