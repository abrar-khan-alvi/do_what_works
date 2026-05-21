import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface DailyLogEntry {
  id: string;
  date: string;
  completed: 'yes' | 'no' | 'pending';
  metricValue: number;
  loggedMetrics?: any;
  notes: string;
  dailyObservation: string;
  aiSuggestion?: string;
}

export interface Experiment {
  id: string;          // string for compatibility (cast from DB int)
  hypothesis: string;
  action: string;
  metric: string;
  durationDays: number;
  startDate: string;   // "YYYY-MM-DD"
  status: 'active' | 'queued' | 'completed' | 'abandoned';
  logs: DailyLogEntry[];
  aiAnalysis?: {
    pragmatic_score: number;
    verdict: string;
    analysis: string;
    recommendation: string;
  };
  metricsConfig?: any;
}

interface ExperimentContextType {
  experiments: Experiment[];
  activeExperiment: Experiment | null;
  isLoading: boolean;
  launchExperiment: (data: Omit<Experiment, 'id' | 'startDate' | 'status' | 'logs'> & { metricsConfig?: any }) => Promise<void>;
  logToday: (experimentId: string, entry: Omit<DailyLogEntry, 'id' | 'date'>) => Promise<void>;
  hasLoggedToday: (experimentId: string) => boolean;
  getTodayLog: (experimentId: string) => DailyLogEntry | null;
  deleteExperiment: (id: string) => Promise<void>;
  archiveExperiment: (id: string, status: 'completed' | 'abandoned') => Promise<void>;
  generateDailyAction: (experimentId: string) => Promise<string | null>;
  fetchExperiments: () => Promise<void>;
}

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

const mapLog = (l: any): DailyLogEntry => ({
  id: String(l.id),
  date: l.date,
  completed: l.completed as 'yes' | 'no' | 'pending',
  metricValue: l.metric_value,
  loggedMetrics: l.logged_metrics || null,
  notes: l.notes || '',
  dailyObservation: l.daily_observation || '',
  aiSuggestion: l.ai_suggestion || '',
});

/** Map API experiment object to internal Experiment */
const mapExperiment = (e: any): Experiment => ({
  id: String(e.id),
  hypothesis: e.hypothesis,
  action: e.action,
  metric: e.metric,
  durationDays: e.duration_days,
  startDate: e.start_date,
  status: e.status as 'active' | 'queued' | 'completed' | 'abandoned',
  logs: (e.logs || []).map(mapLog),
  aiAnalysis: e.ai_analysis,
  metricsConfig: e.metrics_config || null,
});

export const ExperimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchAttempted = useRef(false);

  // Fetch all experiments on mount when authenticated
  const fetchExperiments = useCallback(async () => {
    if (!isAuthenticated || !localStorage.getItem('access_token')) return;
    setIsLoading(true);
    try {
      const res = await api.get('/api/v1/experiments/');
      setExperiments(res.data.map(mapExperiment));
    } catch (err) {
      console.error('Failed to fetch experiments:', err);
    } finally {
      setIsLoading(false);
      fetchAttempted.current = true;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && !fetchAttempted.current) {
      fetchExperiments();
    }
  }, [isAuthenticated, fetchExperiments]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setExperiments([]);
      fetchAttempted.current = false;
    }
  }, [isAuthenticated]);

  const activeExperiment = experiments.find(e => e.status === 'active') || null;

  const launchExperiment = useCallback(async (data: Omit<Experiment, 'id' | 'startDate' | 'status' | 'logs'> & { metricsConfig?: any }) => {
    try {
      const res = await api.post('/api/v1/experiments/', {
        hypothesis: data.hypothesis,
        action: data.action,
        metric: data.metric,
        duration_days: data.durationDays,
        metrics_config: data.metricsConfig,
      });
      const newExperiment = mapExperiment(res.data);
      setExperiments(prev => [...prev, newExperiment]);
    } catch (err) {
      console.error('Failed to launch experiment:', err);
      throw err;
    }
  }, []);

  const logToday = useCallback(async (experimentId: string, entry: Omit<DailyLogEntry, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await api.post(`/api/v1/experiments/${experimentId}/logs/`, {
        completed: entry.completed,
        metric_value: entry.metricValue,
        logged_metrics: entry.loggedMetrics,
        notes: entry.notes,
        daily_observation: entry.dailyObservation,
        date: today,
      });
      await fetchExperiments();
    } catch (err) {
      console.error('Failed to log daily mission:', err);
      throw err;
    }
  }, [fetchExperiments]);


  const hasLoggedToday = useCallback((experimentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const exp = experiments.find(e => e.id === experimentId);
    return !!exp?.logs.find(l => l.date === today && l.completed !== 'pending');
  }, [experiments]);

  const getTodayLog = useCallback((experimentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const exp = experiments.find(e => e.id === experimentId);
    return exp?.logs.find(l => l.date === today) || null;
  }, [experiments]);

  const deleteExperiment = useCallback(async (id: string) => {
    setExperiments(prev => prev.filter(e => e.id !== id)); // optimistic
    try {
      await api.delete(`/api/v1/experiments/${id}/`);
    } catch { /* ignored */ }
  }, []);

  const archiveExperiment = useCallback(async (id: string, status: 'completed' | 'abandoned') => {
    setExperiments(prev => prev.map(e => e.id === id ? { ...e, status } : e)); // optimistic
    try {
      await api.patch(`/api/v1/experiments/${id}/`, { status });
    } catch { /* ignored */ }
  }, []);

  const generateDailyAction = useCallback(async (experimentId: string) => {
    try {
      const res = await api.post(`/api/v1/experiments/${experimentId}/generate-daily-action/`);
      await fetchExperiments(); // Refresh to get the saved suggestion in the log
      return res.data.suggestion;
    } catch (err) {
      console.error('Failed to generate daily action:', err);
      return null;
    }
  }, [fetchExperiments]);

  return (

    <ExperimentContext.Provider value={{
      experiments,
      activeExperiment,
      isLoading,
      launchExperiment,
      logToday,
      hasLoggedToday,
      getTodayLog,
      deleteExperiment,
      archiveExperiment,
      generateDailyAction,
      fetchExperiments,
    }}>
      {children}
    </ExperimentContext.Provider>
  );
};

export const useExperiments = () => {
  const context = useContext(ExperimentContext);
  if (context === undefined) {
    throw new Error('useExperiments must be used within an ExperimentProvider');
  }
  return context;
};
