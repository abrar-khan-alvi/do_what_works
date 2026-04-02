import React from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { ArrowLeft, ArrowRight, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExperimentDetails = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mb-8">
        <button 
          onClick={() => navigate('/result')}
          className="flex items-center gap-2 text-[#8e9299] hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Result</span>
        </button>

        <div className="flex items-center justify-between mb-4">
          <div className="px-4 py-1 rounded-full border border-[#10b981] text-[#10b981] text-sm font-medium">
            Active
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black hover:bg-white/90 transition-colors">
              <Edit2 size={18} />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#e53935] hover:bg-white/90 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
          If I daily execution of specified behavior, then sleep hours will improve.
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1a1b1e]/60 border border-white/10 rounded-xl p-6">
            <div className="text-[#8e9299] text-sm mb-2">Duration</div>
            <div className="text-3xl font-bold text-white">7</div>
          </div>
          <div className="bg-[#1a1b1e]/60 border border-white/10 rounded-xl p-6">
            <div className="text-[#8e9299] text-sm mb-2">Logs</div>
            <div className="text-3xl font-bold text-white">0</div>
          </div>
          <div className="bg-[#1a1b1e]/60 border border-white/10 rounded-xl p-6">
            <div className="text-[#8e9299] text-sm mb-2">Completion</div>
            <div className="text-3xl font-bold text-white">0%</div>
          </div>
        </div>

        <div className="bg-transparent border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium text-white mb-4">Experiment Details</h2>
          <div className="h-px w-full bg-white/10 mb-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="text-[#8e9299] text-sm mb-2">Action</div>
              <div className="text-white text-sm">Daily execution of specified behavior</div>
            </div>
            <div>
              <div className="text-[#8e9299] text-sm mb-2">Metric</div>
              <div className="text-white text-sm">Measurable outcome from your question (number)</div>
            </div>
          </div>
        </div>

        <div className="bg-transparent border border-white/10 rounded-xl p-6 mb-8 min-h-[200px] flex flex-col">
          <h2 className="text-lg font-medium text-white mb-4">Daily Log List</h2>
          <div className="h-px w-full bg-white/10 mb-6" />
          
          <div className="flex-1 flex items-center justify-center text-[#8e9299] text-sm">
            No logs recorded yet
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => navigate('/daily-log')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            <span>Log Entry</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};
