import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AnalystProfile {
  name: string;
  callSign: string;
  role: string;
  department: string;
  clearance: string;
  email: string;
  station: string;
}

const STORAGE_KEY = 'orbital_analyst_profile';

const DEFAULT_PROFILE: AnalystProfile = {
  name: 'Debarghya',
  callSign: 'DGIS-IMINT-01',
  role: 'Imagery Intelligence',
  department: 'Directorate General of Information Systems (DGIS)',
  clearance: 'SECRET // NOFORN',
  email: 'debarghya.imint@dgis.mod.gov.in',
  station: 'HQ Tactical Operations // Air-Gapped Station 4'
};

interface AnalystContextType {
  profile: AnalystProfile;
  updateProfile: (updated: Partial<AnalystProfile>) => void;
  resetProfile: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
}

const AnalystContext = createContext<AnalystContextType | undefined>(undefined);

export const AnalystProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<AnalystProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save analyst profile to localStorage', e);
    }
  }, [profile]);

  const updateProfile = (updated: Partial<AnalystProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
  };

  return (
    <AnalystContext.Provider
      value={{
        profile,
        updateProfile,
        resetProfile,
        isProfileModalOpen,
        setIsProfileModalOpen,
      }}
    >
      {children}
    </AnalystContext.Provider>
  );
};

export const useAnalyst = (): AnalystContextType => {
  const context = useContext(AnalystContext);
  if (!context) {
    throw new Error('useAnalyst must be used within an AnalystProvider');
  }
  return context;
};
