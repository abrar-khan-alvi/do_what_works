import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAccess } from '../components/AccessContext';
import { User, Mail, CreditCard, Shield, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile = () => {
  const { isSubscribed, daysRemaining } = useAccess();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-8 md:gap-12">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row gap-6 md:items-center p-6 md:p-8 bg-[#1a1b1e]/60 border border-white/10 rounded-3xl md:rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative">
              <img 
                src="https://i.pravatar.cc/150?u=jon" 
                alt="Profile" 
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#1a1b1e] ring-2 ring-white/10 shadow-2xl z-10 relative"
              />
              <div className="absolute inset-0 bg-[#C75F33] blur-[30px] opacity-20 -z-10 rounded-full" />
            </div>

            <div className="flex-1 flex flex-col gap-2 relative z-10">
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Dr. Jon Kabir</h1>
              <div className="flex items-center gap-2 text-[#8e9299]">
                <Mail size={16} />
                <span className="text-sm md:text-base">jon.kabir@example.com</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit">
                <Shield size={14} className={isSubscribed ? "text-[#10b981]" : "text-[#e53935]"} />
                <span className="text-xs font-bold uppercase tracking-widest text-white">
                  {isSubscribed ? 'Premium Member' : 'Basic Member'}
                </span>
              </div>
            </div>
            
            <div className="relative z-10">
              <button className="w-full md:w-auto px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95 shadow-xl">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Details Card */}
            <div className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white/5 rounded-xl text-[#C75F33]">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold text-white">Personal Info</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#8e9299] uppercase tracking-widest">Full Name</label>
                  <div className="text-white font-medium p-3 bg-black/20 rounded-xl border border-white/5">Dr. Jon Kabir</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#8e9299] uppercase tracking-widest">Role</label>
                  <div className="text-white font-medium p-3 bg-black/20 rounded-xl border border-white/5">Strategist / User</div>
                </div>
                <div className="pt-4 mt-2 border-t border-white/5 flex gap-4">
                  <button className="flex items-center gap-2 text-sm text-[#8e9299] hover:text-white transition-colors">
                    <Key size={16} />
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="p-6 md:p-8 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-white/5 rounded-xl text-[#10b981]">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Subscription</h2>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{isSubscribed ? daysRemaining : 0}</span>
                    <span className="text-[#8e9299] mb-1 font-medium">Days Left</span>
                  </div>
                  <p className="text-sm text-[#8e9299] leading-relaxed">
                    {isSubscribed 
                      ? "Your Elite access is active. You have full access to Daniel and live experiment tracking."
                      : "Your access has expired or is inactive. Upgrade to unlock the full power of The Dig."}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <Link 
                  to="/subscription"
                  className={`block w-full py-4 text-center rounded-xl font-bold transition-all shadow-xl ${
                    isSubscribed 
                      ? 'bg-white/5 text-white hover:bg-white/10 border border-white/10' 
                      : 'bg-white text-black hover:bg-white/90'
                  }`}
                >
                  {isSubscribed ? 'Manage Subscription' : 'Upgrade Now'}
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
};
