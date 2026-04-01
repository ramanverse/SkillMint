import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Info, Upload, X, Plus, Minus, Eye } from 'lucide-react';
import { useAuth, API } from '../../context/AuthContext';

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video & Animation', 'Music & Audio', 'Data & Analytics', 'Business'];

const STEPS = ['Overview', 'Pricing', 'Media', 'Publish'];

const defaultPkg = () => ({ name: '', description: '', deliveryTime: 3, price: 10 });

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: [],
    tagInput: '',
    images: [],
    packages: {
      basic: { ...defaultPkg(), name: 'Basic' },
      standard: { ...defaultPkg(), name: 'Standard', price: 30 },
      premium: { ...defaultPkg(), name: 'Premium', price: 60 },
    },
  });

  const update = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const updatePkg = (tier, field, val) => setForm(p => ({
    ...p,
    packages: { ...p.packages, [tier]: { ...p.packages[tier], [field]: val } },
  }));

  const addTag = () => {
    const tag = form.tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
      update('tags', [...form.tags, tag]);
      update('tagInput', '');
    }
  };

  const removeTag = (t) => update('tags', form.tags.filter(x => x !== t));

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(p => ({ ...p, images: [...p.images.slice(0, 4), ev.target.result] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!form.title.trim()) { setError('Title is required'); return false; }
      if (!form.description.trim()) { setError('Description is required'); return false; }
      if (!form.category) { setError('Category is required'); return false; }
    }
    if (step === 1) {
      for (const [tier, pkg] of Object.entries(form.packages)) {
        if (!pkg.description.trim()) { setError(`${tier} package description is required`); return false; }
      }
    }
    return true;
  };

  const handleNext = () => { if (validateStep()) setStep(s => Math.min(s + 1, 3)); };
  const handleBack = () => { setError(''); setStep(s => Math.max(s - 1, 0)); };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        tags: form.tags,
        images: form.images,
        packages: Object.entries(form.packages).map(([type, pkg]) => ({ ...pkg, type })),
      };
      const { data } = await API.post('/gigs', payload);
      navigate(`/gigs/${data.id}?created=true`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const completedSteps = [
    form.title && form.description && form.category,
    Object.values(form.packages).every(p => p.description),
    true,
    false,
  ];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl lg:text-3xl text-gray-900">Create New Listing</h1>
        <p className="text-gray-500 mt-1">Share your skills with buyers on SkillMint</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                i === step
                  ? 'bg-mint text-white shadow-md shadow-mint/30'
                  : completedSteps[i]
                  ? 'bg-mint/10 text-mint cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-default'
              }`}
            >
              {completedSteps[i] && i !== step ? (
                <Check size={14} />
              ) : (
                <span className="w-5 h-5 rounded-full bg-current/20 text-xs flex items-center justify-center font-bold">{i + 1}</span>
              )}
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-mint/40' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-6"
            >
              {error && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <Info size={15} /> {error}
                </div>
              )}

              {/* Step 0: Overview */}
              {step === 0 && (
                <div className="space-y-5">
                  <h2 className="font-display font-semibold text-lg text-gray-900">Overview</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Listing Title *</label>
                    <input id="listing-title" className="input-mint" placeholder="e.g., I will design a modern logo for your brand"
                      value={form.title} onChange={e => update('title', e.target.value)} maxLength={120} />
                    <p className="text-xs text-gray-400 mt-1">{form.title.length}/120 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                    <textarea id="listing-description" className="input-mint resize-none h-32"
                      placeholder="Describe your service in detail..."
                      value={form.description} onChange={e => update('description', e.target.value)} maxLength={1200} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                      <select id="listing-category" className="input-mint" value={form.category} onChange={e => update('category', e.target.value)}>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Subcategory</label>
                      <input id="listing-subcategory" className="input-mint" placeholder="e.g., Logo Design"
                        value={form.subcategory} onChange={e => update('subcategory', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (up to 5)</label>
                    <div className="flex gap-2">
                      <input id="listing-tag-input" className="input-mint flex-1" placeholder="Add a tag..."
                        value={form.tagInput}
                        onChange={e => update('tagInput', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                      <button type="button" onClick={addTag} className="btn-secondary px-3">
                        <Plus size={16} />
                      </button>
                    </div>
                    {form.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.tags.map(tag => (
                          <span key={tag} className="flex items-center gap-1 text-sm bg-mint/10 text-mint px-3 py-1 rounded-full">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-mint-dark"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 1: Pricing */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2 className="font-display font-semibold text-lg text-gray-900">Pricing Packages</h2>
                  {['basic', 'standard', 'premium'].map((tier) => {
                    const colors = { basic: 'border-gray-200', standard: 'border-mint/40 bg-mint/2', premium: 'border-amber-200 bg-amber-50/30' };
                    const labels = { basic: '🌱 Basic', standard: '⚡ Standard', premium: '👑 Premium' };
                    return (
                      <div key={tier} className={`border-2 rounded-2xl p-5 ${colors[tier]}`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-semibold text-gray-900">{labels[tier]}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm">₹</span>
                            <input
                              type="number" min="5" max="999"
                              value={form.packages[tier].price}
                              onChange={e => updatePkg(tier, 'price', Number(e.target.value))}
                              className="w-20 text-center font-bold text-lg border-b-2 border-mint focus:outline-none bg-transparent"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <input className="input-mint text-sm" placeholder="Package name (e.g. Logo + source files)"
                            value={form.packages[tier].name}
                            onChange={e => updatePkg(tier, 'name', e.target.value)} />
                          <textarea className="input-mint text-sm resize-none h-20"
                            placeholder="What's included in this package?"
                            value={form.packages[tier].description}
                            onChange={e => updatePkg(tier, 'description', e.target.value)} />
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Delivery:</span>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => updatePkg(tier, 'deliveryTime', Math.max(1, form.packages[tier].deliveryTime - 1))}
                                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                <Minus size={13} />
                              </button>
                              <span className="font-semibold w-12 text-center">{form.packages[tier].deliveryTime} day{form.packages[tier].deliveryTime !== 1 ? 's' : ''}</span>
                              <button type="button" onClick={() => updatePkg(tier, 'deliveryTime', Math.min(30, form.packages[tier].deliveryTime + 1))}
                                className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Media */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2 className="font-display font-semibold text-lg text-gray-900">Media Gallery</h2>
                  <p className="text-sm text-gray-500">Upload up to 5 images to showcase your work.</p>
                  <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-mint/50 hover:bg-mint/5 transition-all">
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                    <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                    <p className="font-medium text-gray-700">Drop images here or click to upload</p>
                    <p className="text-sm text-gray-400 mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </label>
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {form.images.map((src, i) => (
                        <div key={i} className="relative aspect-video rounded-xl overflow-hidden group">
                          <img src={src} className="w-full h-full object-cover" alt="" />
                          <button
                            onClick={() => update('images', form.images.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Publish */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2 className="font-display font-semibold text-lg text-gray-900">Review & Publish</h2>
                  <div className="bg-mint/5 rounded-2xl p-5 border border-mint/20">
                    <h3 className="font-semibold text-gray-900 mb-1">{form.title || 'Untitled listing'}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{form.description}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {form.tags.map(t => <span key={t} className="text-xs bg-white px-2 py-0.5 rounded-full text-mint border border-mint/20">{t}</span>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['basic', 'standard', 'premium'].map(tier => (
                      <div key={tier} className="bg-gray-50 rounded-xl p-4 text-center">
                        <div className="font-bold text-mint text-xl">₹{form.packages[tier].price}</div>
                        <div className="text-xs text-gray-500 capitalize mt-0.5">{tier}</div>
                        <div className="text-xs text-gray-400 mt-1">{form.packages[tier].deliveryTime}d delivery</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5"><Info size={14} className="text-mint" />Your listing will be live immediately after publishing.</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                {step < 3 ? (
                  <button id={`step-${step}-next`} onClick={handleNext} className="btn-primary flex items-center gap-2">
                    Continue <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    id="publish-listing"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                    🚀 Publish Listing
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live Preview */}
        <div className="hidden lg:block">
          <div className="sticky top-8">
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-600">
              <Eye size={15} /> Live Preview
            </div>
            <div className="glass-card overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-mint/20 to-emerald-100 flex items-center justify-center">
                {form.images[0]
                  ? <img src={form.images[0]} className="w-full h-full object-cover" alt="" />
                  : <span className="text-4xl opacity-30">📦</span>
                }
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.[0] || 'Y'}
                  </div>
                  <span className="text-xs text-gray-500">{user?.name || 'You'}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                  {form.title || 'Your listing title will appear here'}
                </p>
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-xs text-amber-400">★★★★★</span>
                  <span className="text-xs text-gray-500">New</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">{form.packages.basic.deliveryTime}d delivery</span>
                  <span className="font-bold text-mint">From ₹{form.packages.basic.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
