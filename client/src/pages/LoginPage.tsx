import React, { useState, useEffect } from 'react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student'
  });

  // Clear any existing auth state on load
  useEffect(() => {
    // Clear localStorage auth data
    localStorage.removeItem('manus-runtime-user-info');
    
    // Clear all localStorage items that might contain auth data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('auth') || key.includes('user') || key.includes('session')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Force a hard refresh to clear any cached state
    if (window.performance.getEntriesByType('navigation').length > 0) {
      const navEntry = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry.type === 'reload') {
        // Page was reloaded, but we don't need to do anything special
        console.log('Page was reloaded, auth state cleared');
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    // Simulate login/signup
    if (isLogin) {
      // Login logic
      if (formData.role === 'student') {
        window.location.href = '/student';
      } else {
        window.location.href = '/admin';
      }
    } else {
      // Signup logic
      window.location.href = '/student'; // Redirect to student dashboard after signup
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 inline-block">
            <div className="text-4xl font-bold text-white">🎓</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Smart Exam Proctor</h1>
          <p className="text-blue-200">AI-Powered Exam Monitoring System</p>
        </div>

        {/* Login/Signup Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-white text-blue-900 shadow-md' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-white text-blue-900 shadow-md' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
                required
              />
            </div>

            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="student" className="bg-gray-800">Student</option>
                <option value="admin" className="bg-gray-800">Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-lg"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <h3 className="text-white font-medium mb-3 text-center">✨ Key Features</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center text-white/80">
                <span className="mr-2">👁️</span>
                <span>AI Camera Monitoring</span>
              </div>
              <div className="flex items-center text-white/80">
                <span className="mr-2">📱</span>
                <span>Phone Detection</span>
              </div>
              <div className="flex items-center text-white/80">
                <span className="mr-2">⚡</span>
                <span>Real-time Alerts</span>
              </div>
              <div className="flex items-center text-white/80">
                <span className="mr-2">🔒</span>
                <span>Secure Exams</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>© 2024 Smart Exam Proctor. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;