import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  Globe,
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ChevronLeft,
  Sparkles,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface VigilAuthViewProps {
  initialMode?: 'signin' | 'signup' | 'forgot_password';
  onSuccess?: () => void;
  onExploreAsGuest?: () => void;
}

export const VigilAuthView: React.FC<VigilAuthViewProps> = ({
  initialMode = 'signin',
  onSuccess,
  onExploreAsGuest
}) => {
  const {
    signin,
    signup,
    isLoading,
    isSessionExpired,
    clearSessionExpiredFlag,
    requestPasswordReset,
    resetPassword
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>(initialMode);

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up State
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpOrg, setSignUpOrg] = useState('');
  const [signUpCountry, setSignUpCountry] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);

  // Forgot Password State
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resetHint, setResetHint] = useState<string | null>(null);

  // Feedback Messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Live UTC Clock
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

  // Quick Credential Fill for Evaluators & Multi-Device Testing
  const handleQuickFill = (role: 'debartha' | 'user' | 'admin') => {
    clearSessionExpiredFlag();
    setErrorMessage(null);
    setMode('signin');
    if (role === 'debartha') {
      setSignInIdentifier('debartha18');
      setSignInPassword('Orbital@User2026!');
    } else if (role === 'admin') {
      setSignInIdentifier('admin@orbitalintel.io');
      setSignInPassword('Orbital@Admin2026!');
    } else {
      setSignInIdentifier('debarghya@gmail.com');
      setSignInPassword('Orbital@User2026!');
    }
  };

  // Sign In Handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signInIdentifier.trim()) {
      setErrorMessage('Please enter your email address or username.');
      return;
    }
    if (!signInPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = await signin(signInIdentifier, signInPassword, rememberMe);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage(res.message || 'Invalid email/username or password. Please try again.');
    }
  };

  // Sign Up Handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signUpFullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@') || !signUpEmail.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!signUpUsername.trim() || signUpUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }
    if (signUpPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const res = await signup({
      full_name: signUpFullName,
      email: signUpEmail,
      username: signUpUsername,
      password: signUpPassword,
      confirm_password: signUpConfirmPassword,
      organization: signUpOrg,
      country: signUpCountry
    });

    if (res.success) {
      setSuccessMessage('Account created successfully! Redirecting to Orbital Intel Dashboard...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 700);
    } else {
      setErrorMessage(res.message || 'Failed to create account. Please check your details.');
    }
  };

  // Forgot Password Step 1
  const handleForgotStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!resetEmail.trim()) {
      setErrorMessage('Please enter your registered email address or username.');
      return;
    }

    const res = await requestPasswordReset(resetEmail);
    if (res.success) {
      setResetStep(2);
      if (res.hint) setResetHint(res.hint);
    } else {
      setErrorMessage(res.message);
    }
  };

  // Forgot Password Step 2
  const handleForgotStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetCode.trim()) {
      setErrorMessage('Please enter the verification code.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const res = await resetPassword(resetEmail, resetCode, newPassword);
    if (res.success) {
      setSuccessMessage('Password reset successfully! Please sign in with your new password.');
      setMode('signin');
      setSignInPassword('');
      setResetStep(1);
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#060D17] text-white flex flex-col justify-between font-sans relative overflow-x-hidden overflow-y-auto">
      {/* Background Geospatial Ambient Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#0284C7]/10 blur-[130px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10213615_1px,transparent_1px),linear-gradient(to_bottom,#10213615_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-[#0284C7]/15 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 shrink-0 h-16 border-b border-[#182A40]/80 px-4 sm:px-6 flex items-center justify-between bg-[#070E18]/85 backdrop-blur-md">
        <div className="flex items-center space-x-3.5">
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
              <span className="text-[#38BDF8] font-normal text-xs">| Earth Observation Intelligence</span>
            </div>
            <div className="text-[10px] text-[#64748B] font-mono">
              Multi-Temporal Satellite Retrieval & Change Analysis Platform
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-3 text-xs font-sans">
          {onExploreAsGuest && (
            <button
              onClick={onExploreAsGuest}
              className="px-3 py-1.5 rounded-lg border border-[#182A40] bg-[#0B1523] text-[#94A3B8] hover:text-white hover:border-[#0284C7] transition cursor-pointer flex items-center space-x-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Explore as Guest</span>
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-3 text-xs font-mono text-[#94A3B8] pl-2 border-l border-[#182A40]">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#0B1523] border border-[#182A40]">
              <Radio className="w-3 h-3 text-[#10B981] animate-pulse" />
              <span className="text-[#10B981]">SYSTEM OPERATIONAL</span>
            </div>
            <div className="hidden md:flex items-center space-x-1.5 text-[#64748B]">
              <Clock className="w-3 h-3" />
              <span className="text-white/80">{utcTime || 'UTC 00:00:00'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Center Canvas */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-6 py-6 sm:py-10 w-full min-h-0">
        <div className="w-full max-w-[480px] bg-[#0B1523]/95 border border-[#182A40] rounded-2xl shadow-2xl backdrop-blur-xl p-5 sm:p-8 space-y-5 my-auto shrink-0">
          {/* Top Pill Switcher: Sign In vs Sign Up */}
          <div className="flex items-center p-1 rounded-xl bg-[#070D16] border border-[#182A40]">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                mode === 'signin'
                  ? 'bg-[#0284C7] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                mode === 'signup'
                  ? 'bg-[#0284C7] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Heading and Subtitle */}
          <div className="space-y-1 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {mode === 'signup'
                ? 'Create your Orbital Intel Account'
                : mode === 'forgot_password'
                ? 'Reset your Password'
                : 'Sign In to Orbital Intel'}
            </h1>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {mode === 'signup'
                ? 'Join researchers, analysts, and public observers analyzing global Earth data'
                : mode === 'forgot_password'
                ? 'Enter your registered email or username to restore access'
                : 'Access multi-temporal satellite imagery and change intelligence'}
            </p>
          </div>

          {/* Alert Messages */}
          {isSessionExpired && mode === 'signin' && (
            <div className="p-3 rounded-lg bg-[#2D1215] border border-[#EF4444]/60 text-xs text-[#FCA5A5] flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#2D1215] border border-[#EF4444]/60 text-xs text-[#FCA5A5] flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-[#063327] border border-[#10B981]/60 text-xs text-[#6EE7B7] flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ===================== MODE 1: SIGN IN ===================== */}
          {mode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                  Email Address or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={signInIdentifier}
                    onChange={(e) => {
                      setSignInIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="name@email.com or username"
                    autoComplete="username"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] rounded-lg text-sm text-white placeholder-[#475569] font-sans transition outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <label className="font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setResetEmail(signInIdentifier);
                      setErrorMessage(null);
                    }}
                    className="text-[#38BDF8] hover:text-[#00E5FF] transition cursor-pointer font-sans"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => {
                      setSignInPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-11 py-2.5 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7] rounded-lg text-sm text-white placeholder-[#475569] font-sans transition outline-none"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowSignInPassword((prev) => !prev);
                    }}
                    className="absolute inset-y-0 right-0 w-11 h-full flex items-center justify-center text-[#64748B] hover:text-[#00E5FF] active:text-[#00E5FF] transition-colors cursor-pointer z-20 touch-manipulation focus:outline-none"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-[#94A3B8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#070D16] border-[#182A40] text-[#0284C7] focus:ring-[#0284C7] cursor-pointer"
                  />
                  <span>Remember me (30 days)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 px-4 mt-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Orbital Intel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-[#94A3B8]">
                <span>Don&apos;t have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className="text-[#38BDF8] hover:underline font-semibold cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* ===================== MODE 2: SIGN UP ===================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={signUpFullName}
                    onChange={(e) => setSignUpFullName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    className="w-full px-3 py-2 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-sans outline-none"
                  />
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value.replace(/[^a-zA-Z0-9_\-\.]/g, ''))}
                    placeholder="e.g. Alex_Geo"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full px-3 py-2 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-mono outline-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                  Email Address * (Any provider: Gmail, Outlook, University, etc.)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="alex@example.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-sans outline-none"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                    Password (min 8 chars) *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="At least 8 chars"
                      className="w-full pl-3 pr-11 py-2 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-sans outline-none"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowSignUpPassword((prev) => !prev);
                      }}
                      className="absolute inset-y-0 right-0 w-11 h-full flex items-center justify-center text-[#64748B] hover:text-[#00E5FF] active:text-[#00E5FF] transition-colors cursor-pointer z-20 touch-manipulation focus:outline-none"
                    >
                      {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                    Confirm Password *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showSignUpConfirmPassword ? 'text' : 'password'}
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-3 pr-11 py-2 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-sans outline-none"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showSignUpConfirmPassword ? 'Hide password' : 'Show password'}
                      onMouseDown={(e) => e.preventDefault()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowSignUpConfirmPassword((prev) => !prev);
                      }}
                      className="absolute inset-y-0 right-0 w-11 h-full flex items-center justify-center text-[#64748B] hover:text-[#00E5FF] active:text-[#00E5FF] transition-colors cursor-pointer z-20 touch-manipulation focus:outline-none"
                    >
                      {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Org and Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">
                    Organization / Institute (Optional)
                  </label>
                  <input
                    type="text"
                    value={signUpOrg}
                    onChange={(e) => setSignUpOrg(e.target.value)}
                    placeholder="e.g. ISRO SAC, IIT Lab, or University"
                    className="w-full px-3 py-1.5 bg-[#070D16] border border-[#182A40] rounded-lg text-xs text-white font-sans outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-[0.05em] text-[#64748B]">
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    value={signUpCountry}
                    onChange={(e) => setSignUpCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full px-3 py-1.5 bg-[#070D16] border border-[#182A40] rounded-lg text-xs text-white font-sans outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 px-4 mt-2 rounded-lg bg-[#10B981] hover:bg-[#059669] active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-lg disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Start Exploring</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1 text-xs text-[#94A3B8]">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                  }}
                  className="text-[#38BDF8] hover:underline font-semibold cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ===================== MODE 3: FORGOT PASSWORD ===================== */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setResetHint(null);
                }}
                className="inline-flex items-center space-x-1.5 text-xs text-[#94A3B8] hover:text-white cursor-pointer transition mb-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>

              {resetHint && (
                <div className="p-3 rounded-lg bg-[#0E2A4A] border border-[#0284C7]/60 text-xs text-[#38BDF8] space-y-1">
                  <div className="font-semibold flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Reset Verification Code</span>
                  </div>
                  <div className="font-mono text-[11px] bg-[#070D16] p-1.5 rounded border border-[#182A40]">
                    {resetHint}
                  </div>
                </div>
              )}

              {resetStep === 1 ? (
                <form onSubmit={handleForgotStep1} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                      Registered Email Address or Username
                    </label>
                    <input
                      type="text"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com or username"
                      className="w-full px-3 py-2.5 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-medium text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <span>Send Verification Code</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleForgotStep2} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="OIT-######"
                      className="w-full px-3 py-2 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                      New Password (min 8 chars)
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 chars"
                        className="w-full px-3 py-2 pr-11 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white outline-none"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        onMouseDown={(e) => e.preventDefault()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowNewPassword((prev) => !prev);
                        }}
                        className="absolute inset-y-0 right-0 w-11 h-full flex items-center justify-center text-[#64748B] hover:text-[#00E5FF] active:text-[#00E5FF] transition-colors cursor-pointer z-20 touch-manipulation focus:outline-none"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#94A3B8]">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-3 py-2 pr-11 bg-[#070D16] border border-[#182A40] focus:border-[#0284C7] rounded-lg text-sm text-white outline-none"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                        onMouseDown={(e) => e.preventDefault()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowConfirmNewPassword((prev) => !prev);
                        }}
                        className="absolute inset-y-0 right-0 w-11 h-full flex items-center justify-center text-[#64748B] hover:text-[#00E5FF] active:text-[#00E5FF] transition-colors cursor-pointer z-20 touch-manipulation focus:outline-none"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 mt-1 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-medium text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <span>Set New Password</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Multi-Device Access Bar for Evaluators, Reviewers & Debartha */}
          <div className="pt-3 border-t border-[#182A40]/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#64748B]">
              <span className="uppercase tracking-[0.05em] flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#38BDF8]" />
                <span>Instant Multi-Device Access:</span>
              </span>
              <span className="font-mono text-[10px] text-[#34D399] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>PC & Mobile Ready</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Account 1: Debartha Dhara (Primary Owner) */}
              <button
                type="button"
                onClick={() => handleQuickFill('debartha')}
                className="p-2 rounded-lg bg-[#070D16] hover:bg-[#0E1A2B] border border-[#182A40] hover:border-[#0284C7] text-left transition cursor-pointer group"
              >
                <div className="font-medium text-white group-hover:text-[#38BDF8] flex items-center justify-between">
                  <span>Debartha Dhara</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#0284C7]/20 text-[#38BDF8] font-mono">Lead</span>
                </div>
                <div className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">
                  debartha18
                </div>
              </button>

              {/* Account 2: Platform Admin */}
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="p-2 rounded-lg bg-[#070D16] hover:bg-[#0E1A2B] border border-[#182A40] hover:border-[#A855F7] text-left transition cursor-pointer group"
              >
                <div className="font-medium text-white group-hover:text-[#C084FC] flex items-center justify-between">
                  <span>Platform Admin</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#A855F7]/20 text-[#C084FC] font-mono">Admin</span>
                </div>
                <div className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">
                  admin@orbitalintel.io
                </div>
              </button>

              {/* Account 3: Standard Analyst */}
              <button
                type="button"
                onClick={() => handleQuickFill('user')}
                className="p-2 rounded-lg bg-[#070D16] hover:bg-[#0E1A2B] border border-[#182A40] hover:border-[#10B981] text-left transition cursor-pointer group"
              >
                <div className="font-medium text-white group-hover:text-[#34D399] flex items-center justify-between">
                  <span>Analyst</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#34D399] font-mono">User</span>
                </div>
                <div className="text-[10px] font-mono text-[#64748B] truncate mt-0.5">
                  debarghya@gmail.com
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Information Bar */}
      <footer className="relative z-10 shrink-0 min-h-10 border-t border-[#182A40]/80 px-4 sm:px-6 py-2.5 sm:py-0 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748B] font-mono bg-[#070E18]/85 backdrop-blur-md gap-2 pb-6 sm:pb-2">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-center sm:text-left">
          <span className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>AOI: Tapi Estuary & Hazira Coastal Sector (21.4587° N, 72.7812° E)</span>
          </span>
          <span className="hidden sm:inline text-[#182A40]">|</span>
          <span className="text-[10px] text-[#94A3B8]">
            Sensors: Sentinel-2 MSI (10m) · Sentinel-1 SAR (10m) · Landsat-8/9 OLI (15m)
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px] shrink-0">
          <span className="text-[#10B981] font-semibold">100% PUBLIC ACCESS</span>
          <span>·</span>
          <span>ORBITAL INTEL SATELLITE INTELLIGENCE</span>
        </div>
      </footer>
    </div>
  );
};
