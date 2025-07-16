import React, { useState } from 'react';
import { X, Eye, EyeOff, User, Mail, Lock, Phone } from 'lucide-react';

interface AuthModalProps {
  showAuth: boolean;
  setShowAuth: (show: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string, userData: any) => Promise<{ error: any; message?: string | null }>;
  onResetPassword: (email: string) => Promise<{ error: any; message?: string | null }>;
  t: any;
}

const AuthModal: React.FC<AuthModalProps> = ({
  showAuth,
  setShowAuth,
  authMode,
  setAuthMode,
  onSignIn,
  onSignUp,
  onResetPassword,
  t
}) => {
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // User data for registration (SIMPLIFIED)
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+1'); // Default US
  const [role, setRole] = useState<'volunteer' | 'team_director' | 'artist' | 'attendee'>('volunteer');

  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Validation
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      setError('Invalid email');
      return;
    }

    if (!password) {
      setError('Password required');
      return;
    }

    setLoading(true);
    const result = await onSignIn(email, password);
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setShowAuth(false);
      resetForm();
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    // Validation
    if (!lastName.trim()) {
      setError('Last name required');
      return;
    }

    if (!firstName.trim()) {
      setError('First name required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email');
      return;
    }

    if (!phone.trim()) {
      setError('Phone required');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    const userData = {
      full_name: `${firstName.trim()} ${lastName.trim()}`,
      role: role,
      phone: `${countryCode} ${phone.trim()}`, // Combine country code and number
      // Keep individual fields for reference
      first_name: firstName.trim(),
      last_name: lastName.trim()
    };

    const result = await onSignUp(email, password, userData);
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage(result.message || 'Registration successful! Check your email.');
      setTimeout(() => {
        setShowAuth(false);
        resetForm();
      }, 3000);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (authMode === 'login') {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  const handleResetPassword = async () => {    
    if (!validateEmail(email)) {
      setError('Invalid email');
      return;
    }

    setLoading(true);
    const result = await onResetPassword(email);
    
    if (result.error) {
      setError(result.error.message);
    } else {
      setMessage(result.message || 'Password reset email sent!');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setError('');
    setMessage('');
    setShowResetPassword(false);
  };

  if (!showAuth) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {showResetPassword ? 'Reset Password' : 
             authMode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <button
            onClick={() => setShowAuth(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Success message */}
        {message && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl">
            {message}
          </div>
        )}

        {/* Password reset form */}
        {showResetPassword && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                placeholder="your@email.com"
                style={{ color: '#111827' }}
                required
              />
            </div>
            
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 mt-6"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <button
              onClick={() => setShowResetPassword(false)}
              className="w-full text-violet-600 hover:text-violet-700 font-semibold"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {/* Main form */}
        {!showResetPassword && (
          <div className="space-y-4">
            {/* REGISTER: Last Name */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Your last name"
                  style={{ color: '#111827' }}
                  required
                />
              </div>
            )}

            {/* REGISTER: First Name */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="Your first name"
                  style={{ color: '#111827' }}
                  required
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline w-4 h-4 mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                placeholder="your@email.com"
                style={{ color: '#111827' }}
                required
              />
            </div>

            {/* REGISTER: Phone */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Phone Number *
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white"
                    style={{ color: '#111827' }}
                  >
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+33">🇫🇷 +33</option>
                    <option value="+34">🇪🇸 +34</option>
                    <option value="+39">🇮🇹 +39</option>
                    <option value="+49">🇩🇪 +49</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+61">🇦🇺 +61</option>
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="123-456-7890"
                    style={{ color: '#111827' }}
                    required
                  />
                </div>
              </div>
            )}

            {/* REGISTER: Role */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'volunteer' | 'team_director' | 'artist' | 'attendee')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white"
                  style={{ color: '#111827' }}
                  required
                >
                  <option value="volunteer">🙋‍♀️ Volunteer</option>
                  <option value="team_director">💃 Team Director</option>
                  <option value="artist">🎨 Artist/Instructor</option>
                  <option value="attendee">🎫 Attendee</option>
                </select>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock className="inline w-4 h-4 mr-1" />
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                  placeholder="••••••••"
                  style={{ color: '#111827' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* REGISTER: Confirm Password */}
            {authMode === 'register' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="inline w-4 h-4 mr-1" />
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-400"
                    placeholder="••••••••"
                    style={{ color: '#111827' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Main button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 mt-6"
            >
              {loading ? 'Loading...' : 
               authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        )}

        {/* Navigation links */}
        {!showResetPassword && authMode === 'login' && (
          <div className="mt-6 space-y-3 text-center">
            <button
              onClick={() => setShowResetPassword(true)}
              className="text-violet-600 hover:text-violet-700 font-semibold text-sm"
            >
              Forgot password?
            </button>
            <div>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setError('');
                  setMessage('');
                }}
                className="text-violet-600 hover:text-violet-700 font-semibold"
              >
                No account? Sign up
              </button>
            </div>
          </div>
        )}

        {!showResetPassword && authMode === 'register' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setAuthMode('login');
                setError('');
                setMessage('');
              }}
              className="text-violet-600 hover:text-violet-700 font-semibold"
            >
              Already have an account? Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;