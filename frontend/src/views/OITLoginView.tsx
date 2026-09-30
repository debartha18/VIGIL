import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Globe,
  Radio,
  Clock,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OITLoginViewProps {
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'forgot_password';

export const OITLoginView: React.FC<OITLoginViewProps> = ({ onSuccess }) => {
  const {
    login,
    isLoading,
    isSessionExpired,
    clearSessionExpiredFlag,
    requestPasswordReset,
    resetPassword
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');

  // Form State
  const [userIdOrEmail, setUserIdOrEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Flow State
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1);
  const [resetIdent, setResetIdent] = useState<string>('');
  const [resetCode, setResetCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [resetHint, setResetHint] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Live UTC Clock & Telemetry
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick Credential Fill for Judges & Evaluators
  const handleQuickFill = (role: 'analyst' | 'admin') => {
    clearSessionExpiredFlag();
    setErrorMessage(null);
    if (role === 'analyst') {
      setUserIdOrEmail('OIT-IMINT-804');
      setPassword('Vigil@Oit2026!');
    } else {
      setUserIdOrEmail('OIT-ADMIN-001');
      setPassword('Vigil@Admin2026!');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userIdOrEmail.trim()) {
      setErrorMessage('Please enter your OIT User ID or Official Email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = await login(userIdOrEmail, password, rememberMe);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.message || 'Invalid OIT User ID or password. Please check your credentials and try again.');
    }
  };

  // Forgot Password Actions
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (!resetIdent.trim()) {
      setResetError('Please enter your registered OIT User ID or Email.');
      return;
    }

    setIsResetting(true);
    const res = await requestPasswordReset(resetIdent);
    setIsResetting(false);

    if (res.success) {
      setResetStep(2);
      if (res.hint) setResetHint(res.hint);
    } else {
      setResetError(res.message);
    }
  };

  const handleApplyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!resetCode.trim()) {
      setResetError('Please enter the verification code dispatched to your terminal.');
      return;
    }

    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters with letters, numbers, and symbols.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsResetting(true);
    const res = await resetPassword(resetIdent, resetCode, newPassword);
    setIsResetting(false);

    if (res.success) {
      setResetSuccessMessage('Password updated successfully. You can now sign in with your new credentials.');
      setMode('login');
      setPassword('');
      setResetStep(1);
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setResetError(res.message);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#060D17] text-white flex flex-col justify-between font-sans select-none relative overflow-x-hidden">
      {/* Background Geospatial Ambient Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Radial Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0284C7]/10 blur-[130px] rounded-full" />
        {/* Subtle Cyber Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10213615_1px,transparent_1px),linear-gradient(to_bottom,#10213615_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
        {/* Orbital Trajectory Arc */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#0284C7]/15 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 h-16 border-b border-[#182A40]/80 px-6 flex items-center justify-between bg-[#070E18]/80 backdrop-blur-md">
        <div className="flex items-center space-x-3.5">
          {/* Custom Orbital Globe Icon */}
          <div className="relative flex items-center justify-center w-9 h-9">
            <svg className="w-8 h-8 text-[#00E5FF]" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="11" fill="#0E2238" stroke="#00E5FF" strokeWidth="1.8" />
              <path
                d="M6 18C6 24.6274 11.3726 30 18 30C24.6274 30 30 24.6274 30 18C30 11.3726 24.6274 6 18 6"
                stroke="#00E5FF"
                strokeWidth="1.8"
                strokeDasharray="4 2"
              />
              <ellipse
                cx="18"
                cy="18"
                rx="16"
                ry="5.5"
                transform="rotate(-25 18 18)"
                stroke="#22D3EE"
                strokeWidth="1.6"
              />
              <circle cx="28" cy="12" r="2.2" fill="#00E5FF" />
            </svg>
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Orbital Intel</span>
            </div>
            <div className="text-[10px] text-[#64748B] font-mono">
              Earth Observation & Satellite Intelligence Platform
            </div>
          </div>
        </div>

        {/* Live Telemetry Node Info */}
        <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-[#94A3B8]">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#0B1523] border border-[#182A40]">
            <Radio className="w-3 h-3 text-[#10B981] animate-pulse" />
            <span className="text-[#10B981]">DGIS SECURE GATEWAY</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[#64748B]">
            <Clock className="w-3 h-3" />
            <span className="text-white/80">{utcTime || 'UTC 00:00:00'}</span>
          </div>
        </div>
      </header>

      {/* Main Center Login Canvas */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[460px] bg-[#0B1523]/95 border border-[#182A40] rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6">
          {/* Security Classification Badge */}
          <div className="flex items-center justify-between border-b border-[#182A40] pb-3 text-[11px] font-mono">
            <span className="flex items-center space-x-1.5 text-[#10B981]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OIT AUTHENTICATION PORTAL</span>
            </span>
            <span className="text-[#64748B] uppercase tracking-wider">RESTRICTED ACCESS</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'OIT User Login' : 'Password Recovery'}
            </h1>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {mode === 'login'
                ? 'Sign in to access the Orbital Intel Earth Observation Platform'
                : 'Verify your OIT identity to re-establish platform credentials'}
            </p>
          </div>

          {/* Session Expired Notice */}
          {isSessionExpired && mode === 'login' && (
            <div className="p-3 rounded-lg bg-[#2D1215] border border-[#EF4444]/60 text-xs text-[#FCA5A5] flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
              <span>Your previous OIT session has expired. Please sign in again.</span>
            </div>
          )}

          {/* Password Reset Success Notice */}
          {resetSuccessMessage && (
            <div className="p-3 rounded-lg bg-[#063327] border border-[#10B981]/60 text-xs text-[#6EE7B7] flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Error Message Notice */}
          {errorMessage && mode === 'login' && (
            <div className="p-3 rounded-lg bg-[#2D1215] border border-[#EF4444]/60 text-xs text-[#FCA5A5] flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ----------------- MODE A: LOGIN FORM ----------------- */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* OIT User ID / Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8] flex items-center justify-between">
                  <span>OIT User ID / Official Email</span>
                  <span className="text-[10px] text-[#64748B] font-mono font-normal">e.g. OIT-IMINT-804</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userIdOrEmail}
                    onChange={(e) => {
                      setUserIdOrEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="OIT-IMINT-804 or email@dgis.mod.gov.in"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] rounded-lg text-sm text-white placeholder-[#475569] font-mono transition outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setResetIdent(userIdOrEmail);
                      setErrorMessage(null);
                    }}
                    className="text-[#38BDF8] hover:text-[#00E5FF] transition cursor-pointer font-sans"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter OIT clearance password"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] rounded-lg text-sm text-white placeholder-[#475569] font-mono transition outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-white transition cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-[#94A3B8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#070D16] border-[#182A40] text-[#0284C7] focus:ring-[#0284C7] cursor-pointer"
                  />
                  <span>Remember me on this terminal (30 days)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 px-4 mt-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Orbital Intel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ----------------- MODE B: FORGOT PASSWORD FLOW ----------------- */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setMode('login');
                  setResetError(null);
                  setResetHint(null);
                }}
                className="inline-flex items-center space-x-1.5 text-xs text-[#94A3B8] hover:text-white cursor-pointer transition mb-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>

              {resetError && (
                <div className="p-3 rounded-lg bg-[#2D1215] border border-[#EF4444]/60 text-xs text-[#FCA5A5] flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetHint && (
                <div className="p-3 rounded-lg bg-[#0E2A4A] border border-[#0284C7]/60 text-xs text-[#38BDF8] space-y-1">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Security Challenge Dispatched</span>
                  </div>
                  <div className="font-mono text-[11px] bg-[#070D16] p-1.5 rounded border border-[#182A40]">
                    {resetHint}
                  </div>
                </div>
              )}

              {resetStep === 1 ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                      Registered OIT User ID or Email
                    </label>
                    <input
                      type="text"
                      value={resetIdent}
                      onChange={(e) => setResetIdent(e.target.value)}
                      placeholder="e.g. OIT-IMINT-804"
                      className="w-full px-3 py-2.5 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-mono outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full h-10 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-medium text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    {isResetting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Dispatch Verification Code</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleApplyReset} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="OIT-SEC-######"
                      className="w-full px-3 py-2 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                      New Secure Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full px-3 py-2 pr-10 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                      Confirm New Password
                    </label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-mono outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full h-10 mt-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-medium text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    {isResetting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Apply New Password</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Credentials for Evaluators */}
          <div className="pt-4 border-t border-[#182A40]/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="uppercase tracking-[0.05em] flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                <span>Demo Evaluation Credentials:</span>
              </span>
              <span className="font-mono text-[10px] text-[#38BDF8]">SIH 26227 Review</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('analyst')}
                className="p-2 rounded-lg bg-[#070D16] hover:bg-[#0E1A2B] border border-[#182A40] hover:border-[#0284C7] text-left transition cursor-pointer group"
              >
                <div className="font-medium text-white group-hover:text-[#38BDF8] flex items-center justify-between">
                  <span>OIT Analyst</span>
                  <span className="text-[10px] text-[#10B981] font-mono">User</span>
                </div>
                <div className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">
                  Debarghya // 804
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="p-2 rounded-lg bg-[#070D16] hover:bg-[#0E1A2B] border border-[#182A40] hover:border-[#A855F7] text-left transition cursor-pointer group"
              >
                <div className="font-medium text-white group-hover:text-[#C084FC] flex items-center justify-between">
                  <span>OIT Admin</span>
                  <span className="text-[10px] text-[#C084FC] font-mono">Admin</span>
                </div>
                <div className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">
                  Cmdr. Sharma // 001
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Information Bar */}
      <footer className="relative z-10 h-10 border-t border-[#182A40]/80 px-6 flex items-center justify-between text-[11px] text-[#64748B] font-mono bg-[#070E18]/80 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>AOI: Tapi River & Hazira Port (21.4587° N, 72.7812° E)</span>
          </span>
          <span className="hidden sm:inline text-[#182A40]">|</span>
          <span className="hidden sm:inline">Sensors: Sentinel-2 MSI (10m) · Sentinel-1 SAR (10m)</span>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          <span className="text-[#10B981]">AES-256 GCM</span>
          <span>·</span>
          <span>AIR-GAP COMPLIANT</span>
        </div>
      </footer>
    </div>
  );
};
