import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import loginBg from '../assets/login-bg.jpg';
import kloudspotLogo from '../assets/kloudspot-logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(email, password);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Full-screen background image */}
      <img 
        src={loginBg} 
        alt="Office space" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-between px-8 lg:px-20">
        {/* Welcome text - Left side */}
        <div className="hidden lg:block">
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-2">
            Welcome to the
          </h1>
          <h2 className="text-4xl xl:text-5xl font-bold text-white">
            Crowd Management System
          </h2>
        </div>

        {/* Login Card - Right side */}
        <div className="w-full max-w-sm lg:max-w-md mx-auto lg:mx-0 animate-scale-in">
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            {/* Logo header with gradient */}
            <div className="bg-gradient-to-br from-[#0d4d4d] to-[#1a7a7a] p-8 flex justify-center">
              <img 
                src={kloudspotLogo} 
                alt="Kloudspot" 
                className="h-10 object-contain"
              />
            </div>

            {/* Form section */}
            <div className="bg-white p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Log In *
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Username or email"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 bg-gradient-to-r from-[#1a9a9a] to-[#20b2aa] text-white rounded-full font-medium hover:from-[#158888] hover:to-[#1a9a9a] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-lg"
                >
                  {isLoading ? 'Signing in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
