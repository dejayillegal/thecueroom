import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface AnimationContextType {
  animationsEnabled: boolean;
  isLoading: boolean;
  refreshSettings: () => void;
  setAnimationsEnabled: (enabled: boolean) => void;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const { data: animationSettings, isLoading, refetch } = useQuery({
    queryKey: ['/api/settings/animations'],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  useEffect(() => {
    if (animationSettings !== undefined) {
      setAnimationsEnabled(animationSettings.enabled);
    }
  }, [animationSettings]);

  const refreshSettings = () => {
    refetch();
  };

  return (
    <AnimationContext.Provider
      value={{
        animationsEnabled,
        isLoading,
        refreshSettings,
        setAnimationsEnabled,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}