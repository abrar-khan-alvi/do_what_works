import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface DailyLogEntry {
  id: string;
  date: string;
  completed: 'yes' | 'no';
  metricValue: number;
  notes: string;
  dailyObservation: string;
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
}

interface ExperimentContextType {
  experiments: Experiment[];
  activeExperiment: Experiment | null;
  isLoading: boolean;
  launchExperiment: (data: Omit<Experiment, 'id' | 'startDate' | 'status' | 'logs'>) => Promise<void>;
  logToday: (experimentId: string, entry: Omit<DailyLogEntry, 'id' | 'date'>) => Promise<void>;
  hasLoggedToday: (experimentId: string) => boolean;
  getTodayLog: (experimentId: string) => DailyLogEntry | null;
  deleteExperiment: (id: string) => Promise<void>;
  archiveExperiment: (id: string, status: 'completed' | 'abandoned') => Promise<void>;
  fetchExperiments: () => Promise<void>;
}

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

/** Map API log object to internal DailyLogEntry */
const mapLog = (l: any): DailyLogEntry => ({
  id: String(l.id),
  date: l.date,
  completed: l.completed as 'yes' | 'no',
  metricValue: l.metric_value,
  notes: l.notes || '',
  dailyObservation: l.daily_observation || '',
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

  const launchExperiment = useCallback(async (data: Omit<Experiment, 'id' | 'startDate' | 'status' | 'logs'>) => {
    try {
      const res = await api.post('/api/v1/experiments/', {
        hypothesis: data.hypothesis,
        action: data.action,
        metric: data.metric,
        duration_days: data.durationDays,
      });
      const newExperiment = mapExperiment(res.data);
      setExperiments(prev => [...prev, newExperiment]);
      
      // If we launched a queued experiment, we don't need to do anything else locally
      // because the backend handles the status assignment.
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
        notes: entry.notes,
        daily_observation: entry.dailyObservation,
        date: today,
      });
      
      // IMPORTANT: After logging, we fetch everything again.
      // This ensures that if the experiment was completed and a new one was activated,
      // the frontend state is perfectly in sync with the backend succession.
      await fetchExperiments();
    } catch (err) {
      console.error('Failed to log daily mission:', err);
      throw err;
    }
  }, [fetchExperiments]);

  const hasLoggedToday = useCallback((experimentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const exp = experiments.find(e => e.id === experimentId);
    return !!exp?.logs.find(l => l.date === today);
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
