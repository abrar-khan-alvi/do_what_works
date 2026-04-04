import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DailyLogEntry {
  id: string;
  date: string;
  completed: 'yes' | 'no';
  metricValue: number;
  notes: string;
  dailyObservation: string;
}

export interface Experiment {
  id: string;
  hypothesis: string;
  action: string;
  metric: string;
  durationDays: number;
  startDate: string;        // "YYYY-MM-DD"
  status: 'active' | 'completed' | 'abandoned';
  logs: DailyLogEntry[];
}

interface ExperimentContextType {
  experiments: Experiment[];
  activeExperiment: Experiment | null;
  launchExperiment: (data: Omit<Experiment, 'id' | 'startDate' | 'status' | 'logs'>) => void;
  logToday: (experimentId: string, entry: Omit<DailyLogEntry, 'id' | 'date'>) => void;
  hasLoggedToday: (experimentId: string) => boolean;
  getTodayLog: (experimentId: string) => DailyLogEntry | null;
  deleteExperiment: (id: string) => void;
  archiveExperiment: (id: string, status: 'completed' | 'abandoned') => void;
  restoreExperiment: (id: string) => void;
}

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export const ExperimentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [experiments, setExperiments] = useState<Experiment[]>(() => {
    const stored = localStorage.getItem('dww_experiments');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('dww_experiments', JSON.stringify(experiments));
  }, [experiments]);

  const activeExperiment = experiments.find(e => e.status === 'active') || null;

  const launchExperiment = (data: Omit<Experiment, 'id' | 'startDate' | 'status' | 'logs'>) => {
    // Archive current active experiment if it exists
    const updatedExperiments = experiments.map(e =>
      e.status === 'active' ? { ...e, status: 'abandoned' as const } : e
    );

    const newExperiment: Experiment = {
      ...data,
      id: crypto.randomUUID(),
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      logs: [],
    };

    setExperiments([...updatedExperiments, newExperiment]);
  };

  const logToday = (experimentId: string, entry: Omit<DailyLogEntry, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];

    setExperiments(prev => prev.map(exp => {
      if (exp.id === experimentId) {
        // Remove existing log for today if it exists (update)
        const filteredLogs = exp.logs.filter(log => log.date !== today);
        const newLog: DailyLogEntry = {
          ...entry,
          id: crypto.randomUUID(),
          date: today,
        };

        const updatedLogs = [...filteredLogs, newLog];

        // Auto-complete if duration reached
        let status = exp.status;
        if (updatedLogs.length >= exp.durationDays) {
          status = 'completed';
        }

        return { ...exp, logs: updatedLogs, status };
      }
      return exp;
    }));
  };

  const hasLoggedToday = (experimentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const exp = experiments.find(e => e.id === experimentId);
    return !!exp?.logs.find(log => log.date === today);
  };

  const getTodayLog = (experimentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const exp = experiments.find(e => e.id === experimentId);
    return exp?.logs.find(log => log.date === today) || null;
  };

  const deleteExperiment = (id: string) => {
    setExperiments(prev => prev.filter(e => e.id !== id));
  };

  const archiveExperiment = (id: string, status: 'completed' | 'abandoned') => {
    setExperiments(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  };

  const restoreExperiment = (id: string) => {
    setExperiments(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, status: 'active' as const };
      }
      if (e.status === 'active') {
        return { ...e, status: 'abandoned' as const };
      }
      return e;
    }));
  };

  return (
    <ExperimentContext.Provider value={{
      experiments,
      activeExperiment,
      launchExperiment,
      logToday,
      hasLoggedToday,
      getTodayLog,
      deleteExperiment,
      archiveExperiment,
      restoreExperiment
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
