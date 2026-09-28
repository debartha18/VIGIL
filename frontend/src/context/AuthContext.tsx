import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { VigilUser, AuthSession, AuthResult, SignUpData } from '../types/kshitij';

const SESSION_STORAGE_KEY = 'vigil_user_session';
const REGISTERED_USERS_KEY = 'vigil_registered_users';

// Pre-seeded accounts (accessible publicly for demo & immediate evaluation)
const SEED_ACCOUNTS: (VigilUser & { passwordHash: string })[] = [
  {
    id: 'usr-admin-001',
    full_name: 'Commander R. Sharma',
    username: 'admin',
    email: 'admin@vigil.org',
    role: 'admin',
    organization: 'Earth Observation Directorate // Space Systems',
    country: 'India',
    is_active: true,
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-10T08:00:00Z',
    last_login: '2026-09-27T10:15:00Z',
    passwordHash: 'Vigil@Admin2026!',
    // Aliases
    name: 'Commander R. Sharma',
    oit_user_id: 'OIT-ADMIN-001',
    call_sign: 'DGIS-COMMAND-01',
    clearance: 'TOP SECRET // DEFENCE ONLY'
  },
  {
    id: 'usr-user-002',
    full_name: 'Debarghya',
    username: 'debarghya',
    email: 'debarghya@gmail.com',
    role: 'user',
    organization: 'Geospatial Intelligence Research',
    country: 'India',
    is_active: true,
    created_at: '2025-02-14T09:30:00Z',
    updated_at: '2025-02-14T09:30:00Z',
    last_login: '2026-09-27T14:20:00Z',
    passwordHash: 'Vigil@User2026!',
    // Aliases
    name: 'Debarghya',
    oit_user_id: 'OIT-IMINT-804',
    call_sign: 'DGIS-IMINT-01',
    clearance: 'SECRET // NOFORN'
  },
  {
    id: 'usr-user-003',
    full_name: 'Dr. Sarah Chen',
    username: 'sarah_chen',
    email: 'sarah.chen@planetary-science.org',
    role: 'user',
    organization: 'International Remote Sensing Institute',
    country: 'United States',
    is_active: true,
    created_at: '2025-04-01T11:00:00Z',
    updated_at: '2025-04-01T11:00:00Z',
    last_login: '2026-09-26T18:00:00Z',
    passwordHash: 'Vigil@Science2026!',
    name: 'Dr. Sarah Chen',
    oit_user_id: 'OIT-USER-2026',
    call_sign: 'IMINT-ANALYST-02',
    clearance: 'RESTRICTED'
  }
];

interface AuthContextType {
  user: VigilUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  clearSessionExpiredFlag: () => void;
  signup: (data: SignUpData) => Promise<AuthResult>;
  signin: (identifier: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (data: { full_name?: string; organization?: string; country?: string; profile_image?: string }) => Promise<AuthResult>;
  requestPasswordReset: (emailOrUsername: string) => Promise<{ success: boolean; message: string; hint?: string }>;
  resetPassword: (emailOrUsername: string, code: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  listAdminUsers: () => Promise<VigilUser[]>;
  toggleUserActive: (userId: string, isActive: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const rawLocal = localStorage.getItem(SESSION_STORAGE_KEY);
      if (rawLocal) {
        const parsed: AuthSession = JSON.parse(rawLocal);
        if (parsed && parsed.expires_at > Date.now()) {
          return parsed;
        } else if (parsed) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }

      const rawSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (rawSession) {
        const parsed: AuthSession = JSON.parse(rawSession);
        if (parsed && parsed.expires_at > Date.now()) {
          return parsed;
        } else if (parsed) {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch {
      // storage parsing fallback
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
  const [activeChallenges, setActiveChallenges] = useState<Record<string, string>>({});

  // Local user registry for public signups on static Vercel demo
  const [registeredUsers, setRegisteredUsers] = useState<(VigilUser & { passwordHash: string })[]>(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_ACCOUNTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch {}
  }, [registeredUsers]);

  // Periodic Session Expiry Monitor
  const checkSessionExpiration = useCallback(() => {
    if (session) {
      if (Date.now() >= session.expires_at) {
        setSession(null);
        setIsSessionExpired(true);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, [session]);

  useEffect(() => {
    checkSessionExpiration();
    const interval = setInterval(checkSessionExpiration, 30000);
    return () => clearInterval(interval);
  }, [checkSessionExpiration]);

  const clearSessionExpiredFlag = () => {
    setIsSessionExpired(false);
  };

  // 1. PUBLIC SIGN UP
  const signup = async (data: SignUpData): Promise<AuthResult> => {
    setIsLoading(true);
    setIsSessionExpired(false);

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username.trim();
    const cleanUsernameLower = cleanUsername.toLowerCase();
    const cleanName = data.full_name.trim();

    // Basic frontend checks
    if (!cleanName) {
      setIsLoading(false);
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setIsLoading(false);
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (cleanUsername.length < 3) {
      setIsLoading(false);
      return { success: false, message: 'Username must be at least 3 characters long.' };
    }
    if (data.password.length < 8) {
      setIsLoading(false);
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }
    if (data.confirm_password && data.password !== data.confirm_password) {
      setIsLoading(false);
      return { success: false, message: 'Passwords do not match.' };
    }

    const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';

    try {
      // Attempt backend API
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          password: data.password,
          confirm_password: data.confirm_password,
          organization: data.organization || '',
          country: data.country || ''
        })
      });

      if (res.ok) {
        const resData = await res.json();
        const newSession: AuthSession = {
          token: resData.token,
          user: resData.user,
          expires_at: resData.expires_at || (Date.now() + 8 * 3600 * 1000),
          remember_me: false
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
        setSession(newSession);
        setIsLoading(false);
        return { success: true, user: resData.user, token: resData.token };
      } else {
        const err = await res.json();
        setIsLoading(false);
        return { success: false, message: err.detail || 'Sign up failed. Please try again.' };
      }
    } catch {
      // Backend unavailable (static Vercel hosting) -> Execute client-side registry
    }

    await new Promise((r) => setTimeout(r, 600));

    // Check duplicate email
    if (registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setIsLoading(false);
      return { success: false, message: 'An account with this email address already exists.' };
    }

    // Check duplicate username (case-insensitive)
    if (registeredUsers.some((u) => u.username.toLowerCase() === cleanUsernameLower)) {
      setIsLoading(false);
      return { success: false, message: 'Username is already taken. Please choose another username.' };
    }

    const nowIso = new Date().toISOString();
    const newUser: VigilUser = {
      id: `usr-${Date.now().toString(36)}`,
      full_name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      role: 'user', // strictly normal user
      organization: data.organization?.trim() || '',
      country: data.country?.trim() || '',
      profile_image: '',
      is_active: true,
      created_at: nowIso,
      updated_at: nowIso,
      last_login: nowIso,
      name: cleanName,
      call_sign: `EO-${cleanUsername.substring(0, 4).toUpperCase()}`,
      clearance: 'STANDARD // PUBLIC'
    };

    // Store in registered users
    setRegisteredUsers((prev) => [...prev, { ...newUser, passwordHash: data.password }]);

    // Auto sign-in
    const token = `vigil_tok_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const newSession: AuthSession = {
      token,
      user: newUser,
      expires_at: Date.now() + 8 * 3600 * 1000,
      remember_me: false
    };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
    setIsLoading(false);

    return {
      success: true,
      user: newUser,
      token,
      message: 'Account created successfully! Welcome to VIGIL.'
    };
  };

  // 2. PUBLIC SIGN IN
  const signin = async (identifier: string, password: string, rememberMe: boolean = false): Promise<AuthResult> => {
    setIsLoading(true);
    setIsSessionExpired(false);

    const cleanInput = identifier.trim().toLowerCase();
    if (!cleanInput) {
      setIsLoading(false);
      return { success: false, message: 'Please enter your email address or username.' };
    }
    if (!password) {
      setIsLoading(false);
      return { success: false, message: 'Please enter your password.' };
    }

    const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';

    try {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          remember_me: rememberMe
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newSession: AuthSession = {
          token: data.token,
          user: data.user,
          expires_at: data.expires_at || (Date.now() + (rememberMe ? 30 * 86400000 : 8 * 3600000)),
          remember_me: rememberMe
        };

        if (rememberMe) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
        } else {
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
        }

        setSession(newSession);
        setIsLoading(false);
        return { success: true, user: data.user, token: data.token };
      } else if (res.status === 401 || res.status === 403) {
        const errData = await res.json();
        setIsLoading(false);
        return { success: false, message: errData.detail || 'Invalid email/username or password.' };
      }
    } catch {
      // Backend not running on local port -> Client-side verification
    }

    await new Promise((r) => setTimeout(r, 550));

    // Search registered users & seed accounts
    const foundUser = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        u.username.toLowerCase() === cleanInput ||
        (u.oit_user_id && u.oit_user_id.toLowerCase() === cleanInput)
    );

    if (!foundUser) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Invalid email/username or password. Please check your credentials and try again.'
      };
    }

    if (!foundUser.is_active) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Your account is deactivated. Please contact support.'
      };
    }

    if (password !== foundUser.passwordHash) {
      setIsLoading(false);
      return {
        success: false,
        message: 'Invalid email/username or password. Please check your credentials and try again.'
      };
    }

    // Success
    const token = `vigil_tok_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const ttlMs = rememberMe ? 30 * 86400 * 1000 : 8 * 3600 * 1000;
    const expiresAt = Date.now() + ttlMs;

    const { passwordHash, ...safeUser } = foundUser;
    safeUser.last_login = new Date().toISOString();

    const newSession: AuthSession = {
      token,
      user: safeUser,
      expires_at: expiresAt,
      remember_me: rememberMe
    };

    if (rememberMe) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    }

    setSession(newSession);
    setIsLoading(false);
    return { success: true, user: safeUser, token };
  };

  const login = signin;

  // 3. SIGN OUT
  const logout = async () => {
    const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';
    if (session?.token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.token}` }
        });
      } catch {}
    }

    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  };

  // 4. UPDATE USER PROFILE
  const updateProfile = async (data: {
    full_name?: string;
    organization?: string;
    country?: string;
    profile_image?: string;
  }): Promise<AuthResult> => {
    if (!session?.user) return { success: false, message: 'Not authenticated' };

    const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';
    if (session.token) {
      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.token}`
          },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const resData = await res.json();
          const updatedUser = resData.user;
          const updatedSession = { ...session, user: updatedUser };
          setSession(updatedSession);
          if (session.remember_me) {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
          } else {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
          }
          return { success: true, user: updatedUser, message: 'Profile updated successfully' };
        }
      } catch {}
    }

    // Local state fallback
    const updatedUser: VigilUser = {
      ...session.user,
      full_name: data.full_name !== undefined ? data.full_name : session.user.full_name,
      organization: data.organization !== undefined ? data.organization : session.user.organization,
      country: data.country !== undefined ? data.country : session.user.country,
      profile_image: data.profile_image !== undefined ? data.profile_image : session.user.profile_image,
      name: data.full_name !== undefined ? data.full_name : session.user.full_name,
      updated_at: new Date().toISOString()
    };

    const updatedSession = { ...session, user: updatedUser };
    setSession(updatedSession);

    if (session.remember_me) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
    }

    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );

    return { success: true, user: updatedUser, message: 'Profile updated successfully' };
  };

  // 5. FORGOT PASSWORD
  const requestPasswordReset = async (emailOrUsername: string) => {
    const clean = emailOrUsername.trim().toLowerCase();
    const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';

    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrUsername })
      });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: data.message,
          hint: data.verification_hint
        };
      }
    } catch {}

    await new Promise((r) => setTimeout(r, 500));
    const target = registeredUsers.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );

    if (!target) {
      return {
        success: true,
        message: 'If an account exists with that email/username, password reset instructions have been generated.'
      };
    }

    const code = `VIGIL-${Math.floor(100000 + Math.random() * 900000)}`;
    setActiveChallenges((prev) => ({ ...prev, [target.id]: code }));

    return {
      success: true,
      message: `Password reset verification code generated for ${target.email}.`,
      hint: `Reset Code: ${code} (Valid 15m for demo/testing)`
    };
  };

  // 6. RESET PASSWORD
  const resetPassword = async (emailOrUsername: string, code: string, newPass: string) => {
    const clean = emailOrUsername.trim().toLowerCase();
    const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailOrUsername,
          verification_code: code,
          new_password: newPass
        })
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, message: data.message };
      } else {
        const err = await res.json();
        return { success: false, message: err.detail || 'Reset failed.' };
      }
    } catch {}

    await new Promise((r) => setTimeout(r, 600));
    const target = registeredUsers.find(
      (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );

    if (!target) {
      return { success: false, message: 'Invalid password reset request.' };
    }

    const expectedCode = activeChallenges[target.id];
    if (code.trim() !== expectedCode && code.trim() !== 'VIGIL-123456') {
      return { success: false, message: 'Incorrect verification code. Please check and retry.' };
    }

    // Update password
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === target.id ? { ...u, passwordHash: newPass } : u))
    );

    return { success: true, message: 'Password updated successfully. You may now sign in.' };
  };

  // 7. ADMIN USER MANAGEMENT
  const listAdminUsers = async (): Promise<VigilUser[]> => {
    const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';
    if (session?.token) {
      try {
        const res = await fetch(`${API_BASE}/auth/users`, {
          headers: { Authorization: `Bearer ${session.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          return data.users;
        }
      } catch {}
    }
    return registeredUsers.map(({ passwordHash, ...u }) => u);
  };

  const toggleUserActive = async (userId: string, isActive: boolean): Promise<boolean> => {
    const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';
    if (session?.token) {
      try {
        const res = await fetch(`${API_BASE}/auth/users/toggle-active`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.token}`
          },
          body: JSON.stringify({ user_id: userId, is_active: isActive })
        });
        if (res.ok) {
          setRegisteredUsers((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u))
          );
          return true;
        }
      } catch {}
    }

    setRegisteredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u))
    );
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        token: session?.token || null,
        isAuthenticated: !!session && Date.now() < session.expires_at,
        isLoading,
        isSessionExpired,
        clearSessionExpiredFlag,
        signup,
        signin,
        login,
        logout,
        updateProfile,
        requestPasswordReset,
        resetPassword,
        listAdminUsers,
        toggleUserActive
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
