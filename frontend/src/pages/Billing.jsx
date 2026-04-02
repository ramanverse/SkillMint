import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Shield, Plus, ChevronRight, Zap } from 'lucide-react';

const TRANSACTIONS = [
  { id: 'TX-9012', type: 'PAYOUT', amount: '₹14,500', status: 'COMPLETED', date: 'Oct 24, 2026' },
  { id: 'TX-9013', type: 'SERVICE_FEE', amount: '₹1,450', status: 'COMPLETED', date: 'Oct 24, 2026' },
  { id: 'TX-9014', type: 'PAYOUT', amount: '₹8,200', status: 'PENDING', date: 'Oct 26, 2026' },
];

export default function Billing() {
  return (
    <div className="space-y-10 pb-20">
      {/* Header & Balance Card */}
      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl font-display font-extrabold text-gray-900 dark:text-white tracking-tighter">Finance Dashboard</h1>
            <div className="liquid-glass p-10 rounded-[3rem] bg-gradient-to-br from-mint/20 to-transparent relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <CreditCard size={150} className="rotate-12" />
               </div>
               <div className="relative z-10">
                  <p className="text-xs font-bold text-mint uppercase tracking-[0.2em] mb-2">Available Balance</p>
                  <h2 className="text-6xl font-display font-extrabold text-gray-900 dark:text-white tracking-tighter mb-8">₹24,850.40</h2>
                  <div className="flex gap-4">
                     <button className="btn-primary py-4 px-10 text-sm shadow-2xl shadow-mint/20">Withdraw Funds</button>
                     <button className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:border-mint transition-all">
                        <Plus size={20} className="text-mint" />
                     </button>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">Active Methods</h3>
            <div className="p-6 rounded-3xl bg-gray-900 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-6 opacity-20">
                  <Zap size={40} className="fill-current" />
               </div>
               <div className="relative z-10 flex flex-col justify-between h-32">
                  <div className="flex justify-between items-start">
                     <CreditCard size={24} />
                     <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-2 py-1 rounded-md">Primary</span>
                  </div>
                  <div>
                     <p className="text-lg font-mono tracking-widest">•••• 8824</p>
                     <p className="text-[10px] text-white/50 font-bold uppercase mt-1">Exp: 08/28</p>
                  </div>
               </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 text-sm font-bold text-gray-400 hover:border-mint/50 hover:text-mint transition-all">
               <Plus size={18} />
               <span>Add Payout Method</span>
            </button>
         </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-6">
         <div className="flex justify-between items-center px-4">
            <h2 className="text-2xl font-display font-extrabold text-gray-900 dark:text-white">Recent Transactions</h2>
            <button className="text-xs font-bold text-mint hover:underline">View All Statements</button>
         </div>
         <div className="space-y-3">
            {TRANSACTIONS.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bento-tile flex items-center gap-6 p-5 hover:border-mint/20 transition-all cursor-pointer group"
              >
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                   tx.type === 'PAYOUT' ? 'bg-mint/10 text-mint' : 'bg-red-500/10 text-red-500'
                 }`}>
                    {tx.type === 'PAYOUT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-mint transition-colors truncate">{tx.type === 'PAYOUT' ? 'Transfer to Bank Account' : 'SkillMint Service Fee'}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mt-1">{tx.date} · {tx.id}</p>
                 </div>
                 <div className="text-right">
                    <p className={`font-display font-extrabold text-lg text-gray-900 dark:text-white ${tx.type === 'PAYOUT' ? 'text-mint' : ''}`}>
                       {tx.type === 'PAYOUT' ? '+' : '-'}{tx.amount}
                    </p>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                      tx.status === 'COMPLETED' ? 'bg-mint/10 text-mint' : 'bg-amber-500/10 text-amber-500'
                    }`}>{tx.status}</span>
                 </div>
                 <ChevronRight size={16} className="text-gray-300 ml-4 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
